import { DatabaseModule, Order } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  providers: [OrderServiceService],
})
export class OrderServiceModule {}
