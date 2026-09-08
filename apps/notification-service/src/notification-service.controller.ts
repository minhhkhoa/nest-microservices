import { EVENT_PATTERNS, Order } from '@app/common';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  //- dùng logger chuẩn của nestjs, tự động định tuyến qua AppLoggerService đã đăng ký ở app.useLogger
  private readonly logger = new Logger(NotificationServiceController.name);

  //- lắng nghe sự kiện bất đồng bộ order_created từ rabbitmq và ghi log kèm correlation id
  @EventPattern(EVENT_PATTERNS.ORDER.ORDER_CREATED)
  handleOrderCreated(@Payload() data: { message: string; order: Order }) {
    this.logger.log({
      type: 'NOTIFICATION_EVENT_RECEIVED',
      pattern: EVENT_PATTERNS.ORDER.ORDER_CREATED,
      orderId: data.order?.id,
      productName: data.order?.productName,
      customerMessage: data.message,
      msg: `📩 [Notification-Service] Nhận được sự kiện [order_created] cho đơn hàng: ${data.order?.productName || 'N/A'}`,
    });
  }
}
