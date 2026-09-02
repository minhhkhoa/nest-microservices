import {
  AllExceptionsFilter,
  LoggingInterceptor,
  PermissionGuard,
  RedisModule,
  TransformInterceptor,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GatewayAuthModule } from './gateway-auth/gateway-auth.module';
import { GatewayJwtAuthGuard } from './gateway-auth/guards/gateway-jwt-auth.guard';
import { GatewayOrdersModule } from './gateway-orders/gateway-orders.module';
import { GatewayRolesPermissionsModule } from './gateway-roles-permissions/gateway-roles-permissions.module';
import { GatewayStorageModule } from './gateway-storage/gateway-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //- đăng ký redis module toàn cục qua biến môi trường
    RedisModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: Number(configService.get<number>('REDIS_PORT', 6380)),
        password: configService.get<string>('REDIS_PASSWORD') || undefined,
      }),
    }),
    //- import các feature modules con
    GatewayAuthModule,
    GatewayRolesPermissionsModule,
    GatewayOrdersModule,
    GatewayStorageModule,
  ],
  providers: [
    //- đăng ký global exception filter: bắt mọi ngoại lệ và ghi log lỗi tập trung
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    //- đăng ký global guards: jwt chạy trước, permission guard chạy sau
    {
      provide: APP_GUARD,
      useClass: GatewayJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    //- đăng ký global interceptors: logging đo hiệu năng, transform chuẩn hóa response
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
