import {
  CurrentUser,
  Public,
  PublicPermission,
  RegisterDto,
  User,
} from '@app/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //- đăng ký tài khoản (route public không cần token)
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.register(registerDto);
  }

  //- đăng nhập sử dụng local guard để xác thực email và password
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  //- xem thông tin tài khoản cá nhân (cần login nhưng không cần check permission)
  @PublicPermission()
  @Get('profile')
  getProfile(@CurrentUser() user: User): User {
    return user;
  }
}
