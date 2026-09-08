import { LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';

@Module({
  imports: [
    //- import logger module quản lý pino và ngữ cảnh correlation id
    LoggerModule,
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
