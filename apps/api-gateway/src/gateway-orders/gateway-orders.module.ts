import { RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { GatewayOrdersController } from './gateway-orders.controller';
import { GatewayOrdersService } from './gateway-orders.service';

@Module({
  imports: [
    //- đăng ký kết nối rabbitmq sang order_service
    RmqModule.register({ name: 'ORDER_SERVICE', queue: 'order_queue' }),
  ],
  controllers: [GatewayOrdersController],
  providers: [GatewayOrdersService],
  exports: [GatewayOrdersService],
})
export class GatewayOrdersModule {}

