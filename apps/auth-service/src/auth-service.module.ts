import { DatabaseModule, Permission, Role, User } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth-service.controller';
import { AuthService } from './auth-service.service';

@Module({
  imports: [
    //- kết nối postgres database auth_db (hoặc order_db)
    DatabaseModule.forRoot({ database: 'order_db' }),
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
