import {
  ROLE_CUSTOMER,
  RegisterDto,
  User,
  comparePassword,
  hashPassword,
} from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';

//- service xử lý xác thực và tài khoản người dùng
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
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

  //- cập nhật refresh token đã băm vào database hoặc gán null khi đăng xuất
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    let hashedRefreshToken: string | null = null;
    if (refreshToken) {
      //- băm refresh token bằng bcrypt để bảo mật cơ sở dữ liệu
      hashedRefreshToken = await hashPassword(refreshToken);
    }

    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
    return { success: true };
  }

  //- xác thực và đối soát refresh token khi client gửi yêu cầu refresh
  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    //- nếu người dùng không tồn tại, bị khóa hoặc chưa có refresh token trong db
    if (!user || !user.isActive || !user.refreshToken) {
      return null;
    }

    //- so khớp refresh token client gửi lên với chuỗi băm trong db
    const isMatch = await comparePassword(refreshToken, user.refreshToken);
    if (!isMatch) {
      return null;
    }

    //- loại bỏ thông tin nhạy cảm trước khi trả về
    const { password: _password, refreshToken: _rt, ...result } = user;
    return result;
  }

  //- thu hồi refresh token của người dùng trong db (đăng xuất)
  async revokeRefreshToken(userId: string) {
    await this.userRepository.update(userId, {
      refreshToken: null,
    });
    return { success: true };
  }
}
