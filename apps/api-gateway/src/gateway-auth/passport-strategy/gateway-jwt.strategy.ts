import { RedisService, User } from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

interface JwtPayload {
  sub?: string;
  id?: string;
  email: string;
}

@Injectable()
export class GatewayJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<User> {
    //- trích xuất raw token từ header authorization
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      //- kiểm tra xem token có nằm trong danh sách đen redis do đã đăng xuất hay không
      const isBlacklisted = await this.redisService.exists(
        `blacklist:token:${token}`,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã bị vô hiệu hóa do đã đăng xuất',
        );
      }
    }

    const userId = payload.sub || payload.id;
    //- lưu ý: đây là nút thắt cổ chai vì mỗi request đều gọi tcp và query database typeorm, sẽ xử lý tối ưu với redis cache hoặc stateless jwt payload sau
    //- gọi sang auth-service lấy đầy đủ user kèm role và permissions
    const user = await firstValueFrom(
      this.authClient.send<User | null>(
        { cmd: 'user_get_with_permissions' },
        { id: userId },
      ),
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc đã bị khóa',
      );
    }

    return user; //- gắn vào req.user để permission.guard sử dụng
  }
}
