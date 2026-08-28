import { TcpModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import ms, { StringValue } from 'ms';
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
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          //- dùng thư viện ms để chuyển đổi chuỗi thời gian như '1d', '7d', '1h' sang mili-giây chính xác
          expiresIn: ms(
            configService.get<string>('JWT_ACCESS_EXPIRES_IN') as StringValue,
          ),
        },
      }),
      inject: [ConfigService],
    }),
    //- đăng ký kết nối tcp sang auth-service qua biến môi trường
    TcpModule.registerAsync({
      name: 'AUTH_SERVICE',
      portKey: 'AUTH_SERVICE_PORT',
      hostKey: 'AUTH_SERVICE_HOST',
    }),
  ],
  controllers: [GatewayAuthController],
  providers: [GatewayAuthService, GatewayLocalStrategy, GatewayJwtStrategy],
  exports: [GatewayAuthService, JwtModule, PassportModule],
})
export class GatewayAuthModule {}
