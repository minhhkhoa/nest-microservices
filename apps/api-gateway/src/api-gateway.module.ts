import { RmqModule, TcpModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

@Module({
  imports: [
    //- đăng ký từng service
    TcpModule.register({ name: 'ORDER_SERVICE', port: 3001 }),
    RmqModule.register({
      name: 'NOTIFICATION_SERVICE',
      queue: 'notification_queue',
    }),
    RmqModule.register({ name: 'INVENTORY_SERVICE', queue: 'inventory_queue' }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
