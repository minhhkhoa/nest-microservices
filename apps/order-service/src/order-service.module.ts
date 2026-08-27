import { DatabaseModule, Order } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from './order.repository';
import { OrderServiceController } from './order-service.controller';
import { OrderServiceService } from './order-service.service';

@Module({
  imports: [
    //- kết nối tới database riêng của service này
    DatabaseModule.forRoot({ database: 'order_db' }),

    //- đăng ký các bảng thực thể mà service này quản lý
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderServiceController],
  providers: [OrderRepository, OrderServiceService],
  exports: [OrderRepository, OrderServiceService],
})
export class OrderServiceModule {}
