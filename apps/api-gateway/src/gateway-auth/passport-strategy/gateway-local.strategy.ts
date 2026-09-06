import { CMD_PATTERNS, SERVICES, User } from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayLocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(SERVICES.AUTH) private readonly authClient: ClientProxy) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    //- gửi message tcp sang auth-service để kiểm tra email & password
    const user = await firstValueFrom(
      this.authClient.send<User | null>(
        { cmd: CMD_PATTERNS.AUTH.VALIDATE_USER },
        { email, password },
      ),
    );

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    return user; //- tự động gán vào req.user
  }
}
