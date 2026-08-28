import { RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { GatewayOrdersController } from './gateway-orders.controller';
import { GatewayOrdersService } from './gateway-orders.service';

@Module({
  imports: [
    //- đăng ký kết nối rabbitmq sang order_service qua biến môi trường
    RmqModule.registerAsync({
      name: 'ORDER_SERVICE',
      queue: process.env.ORDER_QUEUE || 'order_queue',
      urlKey: 'RABBITMQ_URL',
    }),
  ],
  controllers: [GatewayOrdersController],
  providers: [GatewayOrdersService],
  exports: [GatewayOrdersService],
})
export class GatewayOrdersModule {}
