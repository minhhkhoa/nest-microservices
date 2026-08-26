import {
  LoggingInterceptor,
  PermissionGuard,
  RedisModule,
  TransformInterceptor,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { OrdersModule } from './orders/orders.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';

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
    AuthModule,
    RolesPermissionsModule,
    OrdersModule,
  ],
  providers: [
    //- đăng ký global guards: jwt chạy trước, permission guard chạy sau
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
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
