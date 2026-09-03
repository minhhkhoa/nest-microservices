import {
  ApiCustomResponse,
  CurrentUser,
  LoginDto,
  Public,
  PublicPermission,
  RefreshTokenDto,
  RegisterDto,
  ResponseMessage,
  User,
} from '@app/common';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import ms, { StringValue } from 'ms';
import { GatewayAuthService } from './gateway-auth.service';

type CookieMap = Record<string, string | undefined>;

@ApiTags('Auth')
@Controller('auth')
export class GatewayAuthController {
  constructor(
    private readonly authService: GatewayAuthService,
    private readonly configService: ConfigService,
  ) {}

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
    description:
      'Đăng nhập thành công (trả về access token, refresh token và thiết lập httponly cookie)',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(user);

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    //- thiết lập cookie httponly chứa refresh token để phòng chống tấn công xss
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: ms(refreshExpiresIn as StringValue),
    });

    return result;
  }

  //- làm mới access token và xoay vòng refresh token (nhận qua cookie hoặc request body)
  @Public()
  @ApiOperation({ summary: 'Làm mới token (Refresh Token)' })
  @ApiBody({
    type: RefreshTokenDto,
    required: false,
    description:
      'Tùy chọn: truyền refresh token qua body nếu client không hỗ trợ cookie httponly',
  })
  @ResponseMessage('Làm mới token thành công')
  @ApiCustomResponse({
    description: 'Cấp phát cặp token mới thành công và xoay vòng refresh token',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    //- ưu tiên lấy refresh token từ cookie httponly, nếu không có thì đọc từ body
    const cookies: CookieMap | undefined = req.cookies;
    const refreshToken = cookies?.['refresh_token'] || body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Không tìm thấy refresh token trong cookie hoặc request body',
      );
    }

    const result = await this.authService.refreshTokens(refreshToken);

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    //- cập nhật lại cookie httponly với refresh token mới được xoay vòng
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: ms(refreshExpiresIn as StringValue),
    });

    return result;
  }

  //- đăng xuất tài khoản, thu hồi refresh token và đưa access token vào blacklist redis
  @PublicPermission()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Đăng xuất tài khoản' })
  @ResponseMessage('Đăng xuất thành công')
  @ApiCustomResponse({
    description: 'Đăng xuất tài khoản và vô hiệu hóa phiên thành công',
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    //- trích xuất access token từ header authorization để blacklist trên redis
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    //- xóa sạch cookie refresh_token trên trình duyệt client
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth',
    });

    return await this.authService.logout(user.id, accessToken);
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
