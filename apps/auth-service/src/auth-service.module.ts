import {
  DatabaseModule,
  Permission,
  RedisModule,
  Role,
  User,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import ms, { StringValue } from 'ms';
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
    //- đăng ký jwt module để auth service tự ký và xác thực token
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: ms(
            configService.get<string>('JWT_ACCESS_EXPIRES_IN') as StringValue,
          ),
        },
      }),
      inject: [ConfigService],
    }),
    //- đăng ký redis module để auth service tự quản lý token id và blacklist
    RedisModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: Number(configService.get<number>('REDIS_PORT', 6380)),
        password: configService.get<string>('REDIS_PASSWORD') || undefined,
      }),
    }),
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
