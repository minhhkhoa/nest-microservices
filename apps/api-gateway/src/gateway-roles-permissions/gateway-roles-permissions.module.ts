import { TcpModule } from '@app/common';
import { Module } from '@nestjs/common';
import { GatewayPermissionsController } from './gateway-permissions.controller';
import { GatewayRolesPermissionsService } from './gateway-roles-permissions.service';
import { GatewayRolesController } from './gateway-roles.controller';

@Module({
  imports: [
    //- đăng ký kết nối tcp sang auth-service để xử lý role và permission qua biến môi trường
    TcpModule.registerAsync({
      name: 'AUTH_SERVICE',
      portKey: 'AUTH_SERVICE_PORT',
      hostKey: 'AUTH_SERVICE_HOST',
    }),
  ],
  controllers: [GatewayRolesController, GatewayPermissionsController],
  providers: [GatewayRolesPermissionsService],
  exports: [GatewayRolesPermissionsService],
})
export class GatewayRolesPermissionsModule {}
