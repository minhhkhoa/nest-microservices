import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderCreatedEvent } from '@app/common';
import { NotificationServiceService } from './notification-service.service';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationService: NotificationServiceService,
  ) {}

  //- lắng nghe sự kiện order_created từ rabbitmq chuẩn kiểu dữ liệu OrderCreatedEvent
  @EventPattern('order_created')
  handleOrderCreated(@Payload() event: OrderCreatedEvent) {
    console.log(
      '📩 [Notification Service] Nhận được sự kiện order_created chuẩn Event Class:',
      event,
    );
    this.notificationService.sendNotification(event);
  }
}
