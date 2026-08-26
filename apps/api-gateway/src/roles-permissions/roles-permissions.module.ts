import { TcpModule } from '@app/common';
import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { RolesPermissionsService } from './roles-permissions.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [
    //- đăng ký kết nối tcp sang auth-service để xử lý role và permission
    TcpModule.register({ name: 'AUTH_SERVICE', port: 3004 }),
  ],
  controllers: [RolesController, PermissionsController],
  providers: [RolesPermissionsService],
  exports: [RolesPermissionsService],
})
export class RolesPermissionsModule {}
