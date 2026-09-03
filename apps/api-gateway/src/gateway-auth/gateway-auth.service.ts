import { RegisterDto, User } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

//- service proxy tại api gateway chỉ làm nhiệm vụ chuyển tiếp request sang auth-service qua tcp
@Injectable()
export class GatewayAuthService {
  constructor(
    //- inject tcp client auth_service đã đăng ký trong module
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  //- chuyển yêu cầu đăng ký tài khoản sang auth-service qua tcp
  async register(registerDto: RegisterDto): Promise<User> {
    return await firstValueFrom(
      this.authClient.send<User>({ cmd: 'auth_register' }, registerDto),
    );
  }

  //- chuyển yêu cầu đăng nhập và nhận cặp token từ auth-service qua tcp
  async login(user: User): Promise<AuthTokensResponse> {
    return await firstValueFrom(
      this.authClient.send<AuthTokensResponse>(
        { cmd: 'auth_login' },
        { userId: user.id },
      ),
    );
  }

  //- chuyển yêu cầu làm mới token sang auth-service qua tcp
  async refreshTokens(refreshToken: string): Promise<AuthTokensResponse> {
    return await firstValueFrom(
      this.authClient.send<AuthTokensResponse>(
        { cmd: 'auth_refresh_token' },
        { refreshToken },
      ),
    );
  }

  //- chuyển yêu cầu đăng xuất sang auth-service qua tcp
  async logout(
    userId: string,
    accessToken?: string,
  ): Promise<{ message: string }> {
    return await firstValueFrom(
      this.authClient.send<{ message: string }>(
        { cmd: 'auth_logout' },
        { userId, accessToken },
      ),
    );
  }
}
