import { Module } from '@nestjs/common';
import { RmqModule } from '@app/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

@Module({
  imports: [
    //- đăng ký kết nối client rabbitmq gửi tin nhắn tới queue NOTIFICATION_SERVICE_QUEUE
    RmqModule.register({ name: 'NOTIFICATION_SERVICE' }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
