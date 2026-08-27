import { RegisterDto, User } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayAuthService {
  constructor(
    private readonly jwtService: JwtService,
    //- inject tcp client auth_service đã đăng ký trong module
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  //- gửi yêu cầu đăng ký tài khoản sang auth-service qua tcp
  async register(registerDto: RegisterDto): Promise<User> {
    return await firstValueFrom(
      this.authClient.send<User>({ cmd: 'auth_register' }, registerDto),
    );
  }

  //- sinh jwt access token khi người dùng đăng nhập thành công
  login(user: User) {
    const payload = { id: user.id, email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
