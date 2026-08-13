import { Module } from '@nestjs/common';
import { RmqModule } from '@app/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';

@Module({
  imports: [
    RmqModule, //- import module rabbitmq dùng chung từ libs/common
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
