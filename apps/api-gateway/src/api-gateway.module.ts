import {
  LoggingInterceptor,
  RedisModule,
  TransformInterceptor,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GatewayAuthModule } from './gateway-auth/gateway-auth.module';
import { GatewayOrdersModule } from './gateway-orders/gateway-orders.module';
import { GatewayRolesPermissionsModule } from './gateway-roles-permissions/gateway-roles-permissions.module';
import { GatewayStorageModule } from './gateway-storage/gateway-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //- đăng ký redis module toàn cục
    RedisModule.register({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6380', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    }),
    //- import các feature modules con
    GatewayAuthModule,
    GatewayRolesPermissionsModule,
    GatewayOrdersModule,
    GatewayStorageModule,
  ],
  providers: [
    //- đăng ký global guards: jwt chạy trước, permission guard chạy sau
    // {
    //   provide: APP_GUARD,
    //   useClass: GatewayJwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
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
