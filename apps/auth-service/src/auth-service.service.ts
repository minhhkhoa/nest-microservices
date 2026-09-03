import {
  RedisService,
  ROLE_CUSTOMER,
  RegisterDto,
  User,
  comparePassword,
  hashPassword,
} from '@app/common';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';

//- service xử lý xác thực, tài khoản và quản lý vòng đời token tập trung
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  //- kiểm tra email và mật khẩu khi đăng nhập
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password' | 'refreshToken'> | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) return null;

    //- so sánh mật khẩu mã hóa bcrypt
    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) return null;

    //- loại bỏ password và refresh token nhạy cảm trước khi trả về
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...result
    } = user;
    return result;
  }

  //- đăng ký tài khoản mới (mặc định luôn gán vai trò customer)
  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new BadRequestException('Email này đã tồn tại');
    }

    //- băm mật khẩu
    const hashedPassword = await hashPassword(registerDto.password);

    //- luôn gán vai trò mặc định là customer để bảo mật chống leo thang đặc quyền
    const customerRoleCode =
      this.configService.get<string>('DEFAULT_CUSTOMER_ROLE') || ROLE_CUSTOMER;

    let role = await this.roleRepository.findOne({
      where: { code: customerRoleCode },
    });

    if (!role) {
      //- nếu chưa có thì khởi tạo role customer
      role = await this.roleRepository.create({
        code: customerRoleCode,
        name: 'Khách hàng',
        description: 'Người dùng mua sắm và tạo đơn hàng',
        permissions: [],
      });
    }

    const saved = await this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: role,
    });

    //- loại bỏ password và refresh token trước khi trả về
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...result
    } = saved;
    return result;
  }

  //- lấy thông tin user kèm đầy đủ role và permissions (dùng cho jwt strategy)
  async getUserWithPermissions(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user) return null;

    //- loại bỏ password và refresh token trước khi trả về
    const {
      password: _password,
      refreshToken: _refreshToken,
      ...result
    } = user;
    return result;
  }

  //- tạo cặp access token và refresh token (hỗ trợ token rotation và lưu trữ an toàn)
  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    const tokenId = uuidv4();
    const accessPayload = { id: user.id, email: user.email, sub: user.id };
    const refreshPayload = {
      id: user.id,
      email: user.email,
      sub: user.id,
      jti: tokenId,
    };

    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
    ) as string;
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1d';

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
    ) as string;
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    //- ký access token với thời hạn ngắn
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: accessSecret,
      expiresIn: ms(accessExpiresIn as StringValue),
    });

    //- ký refresh token với thời hạn dài hơn
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: ms(refreshExpiresIn as StringValue),
    });

    //- tính toán thời gian sống theo giây để thiết lập ttl redis
    const refreshTtlSeconds = Math.floor(
      ms(refreshExpiresIn as StringValue) / 1000,
    );

    //- lưu token id hiện tại vào redis để kiểm tra token cũ bị dùng lại (reuse detection)
    await this.redisService.set(
      `auth:refresh_token:${user.id}`,
      tokenId,
      refreshTtlSeconds,
    );

    //- băm refresh token bằng bcrypt trước khi lưu vào database postgresql
    const hashedRefreshToken = await hashPassword(refreshToken);
    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    //- loại bỏ trường refresh token nhạy cảm khỏi user object trước khi trả về
    const { refreshToken: _rt, ...cleanUser } = user;

    return {
      accessToken,
      refreshToken,
      user: cleanUser as User,
    };
  }

  //- đăng nhập và sinh cặp token mới cho user theo userId
  async login(userId: string) {
    const user = await this.getUserWithPermissions(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc tài khoản đã bị khóa',
      );
    }
    return await this.generateTokens(user as User);
  }

  //- cấp lại cặp access token và refresh token mới từ refresh token hợp lệ (token rotation)
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
    ) as string;

    let payload: { sub?: string; id?: string; email?: string; jti?: string };
    try {
      //- kiểm tra tính hợp lệ và thời hạn của chữ ký refresh token
      payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const userId = (payload.sub || payload.id) as string;
    const tokenId = payload.jti;

    //- lấy token id đang hoạt động trong redis để phát hiện token cũ
    const currentTokenId = await this.redisService.get(
      `auth:refresh_token:${userId}`,
    );

    //- nếu trong redis có id khác với id gửi lên -> phát hiện hành vi dùng lại token cũ (token reuse)
    if (currentTokenId && tokenId && currentTokenId !== tokenId) {
      //- lập tức thu hồi toàn bộ token của người dùng này để bảo vệ tài khoản
      await this.redisService.del(`auth:refresh_token:${userId}`);
      await this.userRepository.update(userId, { refreshToken: null });
      throw new UnauthorizedException(
        'Phát hiện refresh token cũ được tái sử dụng. Toàn bộ phiên đăng nhập đã bị hủy vì lý do an toàn',
      );
    }

    //- tìm user trong database và đối chiếu refresh token đã băm
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user || !user.isActive || !user.refreshToken) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc tài khoản đã bị vô hiệu hóa',
      );
    }

    const isMatch = await comparePassword(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token không chính xác');
    }

    //- xoay vòng token: tạo mới cả access token và refresh token mới (refresh token rotation)
    return await this.generateTokens(user);
  }

  //- đăng xuất tài khoản, thu hồi refresh token và đưa access token vào redis blacklist
  async logout(userId: string, accessToken?: string) {
    //- xóa id của refresh token trên redis
    await this.redisService.del(`auth:refresh_token:${userId}`);

    //- đặt lại refreshToken = null trong database postgresql
    await this.userRepository.update(userId, {
      refreshToken: null,
    });

    //- nếu có access token, đưa vào redis blacklist với ttl bằng thời gian sống còn lại
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode<{ exp?: number }>(accessToken);
        if (decoded && decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const remainingTtl = decoded.exp - currentTime;
          if (remainingTtl > 0) {
            await this.redisService.set(
              `blacklist:token:${accessToken}`,
              'revoked',
              remainingTtl,
            );
          }
        }
      } catch {
        //- bỏ qua nếu token không giải mã được
      }
    }

    return { message: 'Đăng xuất thành công' };
  }
}
