import { DatabaseModule, Order, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from './order.repository';
import { OrderServiceController } from './order-service.controller';
import { OrderServiceService } from './order-service.service';

@Module({
  imports: [
    //- nạp biến môi trường toàn cục
    ConfigModule.forRoot({ isGlobal: true }),

    //- kết nối tới database postgresql với tên database truyền trực tiếp qua tham số
    DatabaseModule.forRoot({ database: 'order_db' }),

    //- đăng ký các bảng thực thể mà service này quản lý
    TypeOrmModule.forFeature([Order]),

    //- đăng ký kết nối rabbitmq sang inventory_service qua biến môi trường
    RmqModule.registerAsync({
      name: 'INVENTORY_SERVICE',
      queue: process.env.INVENTORY_QUEUE || 'inventory_queue',
      urlKey: 'RABBITMQ_URL',
    }),

    //- đăng ký kết nối rabbitmq sang notification_service qua biến môi trường
    RmqModule.registerAsync({
      name: 'NOTIFICATION_SERVICE',
      queue: process.env.NOTIFICATION_QUEUE || 'notification_queue',
      urlKey: 'RABBITMQ_URL',
    }),
  ],
  controllers: [OrderServiceController],
  providers: [OrderRepository, OrderServiceService],
  exports: [OrderRepository, OrderServiceService],
})
export class OrderServiceModule {}
