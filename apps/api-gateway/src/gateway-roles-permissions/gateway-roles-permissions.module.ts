import { TcpModule } from '@app/common';
import { Module } from '@nestjs/common';
import { GatewayPermissionsController } from './gateway-permissions.controller';
import { GatewayRolesPermissionsService } from './gateway-roles-permissions.service';
import { GatewayRolesController } from './gateway-roles.controller';

@Module({
  imports: [
    //- đăng ký kết nối tcp sang auth-service để xử lý role và permission
    TcpModule.register({ name: 'AUTH_SERVICE', port: 3004 }),
  ],
  controllers: [GatewayRolesController, GatewayPermissionsController],
  providers: [GatewayRolesPermissionsService],
  exports: [GatewayRolesPermissionsService],
})
export class GatewayRolesPermissionsModule {}
