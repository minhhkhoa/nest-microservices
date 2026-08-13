import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderServiceController } from './order-service.controller';
import { OrderServiceService } from './order-service.service';
import { Order } from './order.entity';

@Module({
  imports: [
    //- kết nối tới postgresql container (port 5432)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgrespassword',
      database: 'order_db',
      entities: [Order],
      synchronize: true, //- tự động tạo bảng trong postgresql nếu chưa có (chỉ dùng khi dev)
    }),
    //- đăng ký order repository để thao tác với bảng orders
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderServiceController],
  providers: [OrderServiceService],
})
export class OrderServiceModule {}
