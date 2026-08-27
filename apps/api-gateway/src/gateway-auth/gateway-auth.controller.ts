import {
  ApiCustomResponse,
  CurrentUser,
  LoginDto,
  Public,
  PublicPermission,
  RegisterDto,
  ResponseMessage,
  User,
} from '@app/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayAuthService } from './gateway-auth.service';

@ApiTags('Auth')
@Controller('auth')
export class GatewayAuthController {
  constructor(private readonly authService: GatewayAuthService) {}

  //- đăng ký tài khoản (route public không cần token)
  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ResponseMessage('Đăng ký tài khoản thành công')
  @ApiCustomResponse({
    type: User,
    description: 'Đăng ký tài khoản thành công',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.register(registerDto);
  }

  //- đăng nhập sử dụng local guard để xác thực email và password
  @Public()
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiBody({ type: LoginDto, description: 'Thông tin tài khoản đăng nhập' })
  @ResponseMessage('Đăng nhập thành công')
  @ApiCustomResponse({
    description: 'Đăng nhập thành công (trả về access token và thông tin user)',
  })
  @Post('login')
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  //- xem thông tin tài khoản cá nhân (cần login nhưng không cần check permission)
  @PublicPermission()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  @ResponseMessage('Lấy thông tin tài khoản thành công')
  @ApiCustomResponse({
    type: User,
    description: 'Thông tin người dùng hiện tại',
  })
  @Get('profile')
  getProfile(@CurrentUser() user: User): User {
    return user;
  }
}
