import { TcpModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GatewayAuthController } from './gateway-auth.controller';
import { GatewayAuthService } from './gateway-auth.service';
import { GatewayJwtStrategy } from './passport-strategy/gateway-jwt.strategy';
import { GatewayLocalStrategy } from './passport-strategy/gateway-local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_ACCESS_SECRET') || 'my_jwt_secret',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    //- đăng ký kết nối tcp sang auth-service
    TcpModule.register({ name: 'AUTH_SERVICE', port: 3004 }),
  ],
  controllers: [GatewayAuthController],
  providers: [GatewayAuthService, GatewayLocalStrategy, GatewayJwtStrategy],
  exports: [GatewayAuthService, JwtModule, PassportModule],
})
export class GatewayAuthModule {}
