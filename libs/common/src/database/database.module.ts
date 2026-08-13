import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Notification } from '../entities/notification.entity';

@Module({
  imports: [
    //- cấu hình typeorm kết nối postgresql từ docker-compose
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgrespassword',
      database: 'order_db',
      entities: [Order, Notification],
      synchronize: true, //- tự động đồng bộ schema entity vào postgresql (chỉ dùng khi dev)
    }),
  ],
})
export class DatabaseModule {}
