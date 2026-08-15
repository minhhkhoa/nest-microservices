import { Order } from '@app/common/entities/order/order.entity';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  //- LẮNG NGHE SỰ KIỆN BẤT ĐỒNG BỘ order_created từ rabbitmq
  @EventPattern('order_created')
  handleOrderCreated(@Payload() data: { message: string; order: Order }) {
    console.log('--------------------------------------------------');
    console.log('📩 [Notification-Service] Nhận được sự kiện [order_created]!');
    console.log('📦 Thông tin đơn hàng:', data);
    console.log(
      `📧 Giả lập: Đang gửi email xác nhận cho khách hàng với đơn hàng: ${data.order.productName || 'N/A'}`,
    );
    console.log('--------------------------------------------------');
  }
}
