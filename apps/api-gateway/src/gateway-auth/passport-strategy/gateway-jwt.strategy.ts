import { User } from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
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
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
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
