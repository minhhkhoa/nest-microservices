import {
  CMD_PATTERNS,
  RegisterDto,
  SERVICES,
  User,
  withCorrelationMeta,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

//- service proxy tại api gateway chuyển tiếp request sang auth-service qua tcp kèm correlation id
@Injectable()
export class GatewayAuthService {
  constructor(
    //- inject tcp client auth_service đã đăng ký trong module
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  //- chuyển yêu cầu đăng ký tài khoản sang auth-service qua tcp kèm correlation id
  async register(registerDto: RegisterDto): Promise<User> {
    return await firstValueFrom(
      this.authClient.send<User>(
        { cmd: CMD_PATTERNS.AUTH.REGISTER },
        withCorrelationMeta(registerDto),
      ),
    );
  }

  //- chuyển yêu cầu đăng nhập và nhận cặp token từ auth-service qua tcp kèm correlation id
  async login(user: User): Promise<AuthTokensResponse> {
    return await firstValueFrom(
      this.authClient.send<AuthTokensResponse>(
        { cmd: CMD_PATTERNS.AUTH.LOGIN },
        withCorrelationMeta({ userId: user.id }),
      ),
    );
  }

  //- chuyển yêu cầu làm mới token sang auth-service qua tcp kèm correlation id
  async refreshTokens(refreshToken: string): Promise<AuthTokensResponse> {
    return await firstValueFrom(
      this.authClient.send<AuthTokensResponse>(
        { cmd: CMD_PATTERNS.AUTH.REFRESH_TOKEN },
        withCorrelationMeta({ refreshToken }),
      ),
    );
  }

  //- chuyển yêu cầu đăng xuất sang auth-service qua tcp kèm correlation id
  async logout(
    userId: string,
    accessToken?: string,
  ): Promise<{ message: string }> {
    return await firstValueFrom(
      this.authClient.send<{ message: string }>(
        { cmd: CMD_PATTERNS.AUTH.LOGOUT },
        withCorrelationMeta({ userId, accessToken }),
      ),
    );
  }
}
