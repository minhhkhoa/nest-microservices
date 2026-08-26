import { PermissionGuard } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { OrdersModule } from './orders/orders.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class ApiGatewayModule {}
