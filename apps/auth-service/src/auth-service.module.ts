import { DatabaseModule, Permission, Role, User } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth-service.controller';
import { AuthService } from './auth-service.service';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';

@Module({
  imports: [
    //- kết nối postgres database auth_db (hoặc order_db)
    DatabaseModule.forRoot({ database: 'order_db' }),
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AuthService,
    RolesService,
    PermissionsService,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AuthService,
    RolesService,
    PermissionsService,
  ],
})
export class AuthModule {}
