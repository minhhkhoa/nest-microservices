import { RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { GatewayOrdersController } from './gateway-orders.controller';
import { GatewayOrdersService } from './gateway-orders.service';

@Module({
  imports: [
    //- đăng ký kết nối rabbitmq sang order_service
    RmqModule.register({ name: 'ORDER_SERVICE', queue: 'order_queue' }),
    //- đăng ký kết nối rabbitmq sang notification_service
    RmqModule.register({
      name: 'NOTIFICATION_SERVICE',
      queue: 'notification_queue',
    }),
    //- đăng ký kết nối rabbitmq sang inventory_service
    RmqModule.register({ name: 'INVENTORY_SERVICE', queue: 'inventory_queue' }),
  ],
  controllers: [GatewayOrdersController],
  providers: [GatewayOrdersService],
  exports: [GatewayOrdersService],
})
export class GatewayOrdersModule {}
