import { Injectable } from '@nestjs/common';
import { OrderCreatedEvent } from '@app/common';

@Injectable()
export class NotificationServiceService {
  //- giả lập xử lý gửi email thông báo với dữ liệu chuẩn OrderCreatedEvent
  sendNotification(event: OrderCreatedEvent) {
    console.log(
      `✉️ [Giả lập Email] Đã gửi email tới ${event.customerEmail} cho sản phẩm "${event.productName}" (Mã đơn hàng: ${event.orderId})`,
    );
  }
}
