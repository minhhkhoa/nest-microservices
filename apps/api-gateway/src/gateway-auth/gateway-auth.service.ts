import { RedisService, RegisterDto, User } from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import ms, { StringValue } from 'ms';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GatewayAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    //- inject tcp client auth_service đã đăng ký trong module
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  //- gửi yêu cầu đăng ký tài khoản sang auth-service qua tcp
  async register(registerDto: RegisterDto): Promise<User> {
    return await firstValueFrom(
      this.authClient.send<User>({ cmd: 'auth_register' }, registerDto),
    );
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
      jti: tokenId, //- jti là duy nhất cho mỗi lần tạo mới token
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

    //- gửi tcp sang auth-service để băm và lưu refresh token vào database postgresql
    await firstValueFrom(
      this.authClient.send(
        { cmd: 'auth_update_refresh_token' },
        { userId: user.id, refreshToken },
      ),
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  //- đăng nhập và sinh cặp token cho người dùng
  async login(user: User) {
    return await this.generateTokens(user);
  }

  //- cấp lại cặp access token và refresh token mới từ refresh token hợp lệ
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
      await firstValueFrom(
        this.authClient.send({ cmd: 'auth_revoke_refresh_token' }, { userId }),
      );
      throw new UnauthorizedException(
        'Phát hiện refresh token cũ được tái sử dụng. Toàn bộ phiên đăng nhập đã bị hủy vì lý do an toàn',
      );
    }

    //- xác thực và đối soát với auth-service qua kết nối tcp
    const user = await firstValueFrom(
      this.authClient.send<User | null>(
        { cmd: 'auth_validate_refresh_token' },
        { userId, refreshToken },
      ),
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc tài khoản đã bị vô hiệu hóa',
      );
    }

    //- xoay vòng token: tạo mới cả access token và refresh token mới (refresh token rotation)
    return await this.generateTokens(user);
  }

  //- đăng xuất tài khoản, thu hồi refresh token và đưa access token vào redis blacklist
  async logout(userId: string, accessToken?: string) {
    //- xóa id của refresh token trên redis
    await this.redisService.del(`auth:refresh_token:${userId}`);

    //- gửi tcp sang auth-service để đặt refreshToken = null trong db
    await firstValueFrom(
      this.authClient.send({ cmd: 'auth_revoke_refresh_token' }, { userId }),
    );

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
