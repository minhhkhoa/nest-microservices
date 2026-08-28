import { DatabaseModule, Permission, Role, User } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth-service.controller';
import { AuthService } from './auth-service.service';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthSeederService } from './services/auth-seeder.service';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';

@Module({
  imports: [
    //- nạp biến môi trường toàn cục cho auth service
    ConfigModule.forRoot({ isGlobal: true }),
    //- kết nối postgres database auth_db riêng biệt cho auth service
    DatabaseModule.forRoot({ database: 'auth_db' }),
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
    AuthSeederService,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AuthService,
    RolesService,
    PermissionsService,
    AuthSeederService,
  ],
})
export class AuthModule {}
