import {
  CurrentUser,
  Public,
  PublicPermission,
  RegisterDto,
  ResponseMessage,
  User,
} from '@app/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GatewayAuthService } from './gateway-auth.service';

@Controller('auth')
export class GatewayAuthController {
  constructor(private readonly authService: GatewayAuthService) {}

  //- đăng ký tài khoản (route public không cần token)
  @Public()
  @ResponseMessage('Đăng ký tài khoản thành công')
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.register(registerDto);
  }

  //- đăng nhập sử dụng local guard để xác thực email và password
  @Public()
  @UseGuards(AuthGuard('local'))
  @ResponseMessage('Đăng nhập thành công')
  @Post('login')
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  //- xem thông tin tài khoản cá nhân (cần login nhưng không cần check permission)
  @PublicPermission()
  @ResponseMessage('Lấy thông tin tài khoản thành công')
  @Get('profile')
  getProfile(@CurrentUser() user: User): User {
    return user;
  }
}
