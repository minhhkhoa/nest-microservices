import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto, OrderCreatedEvent } from '@app/common';

@Injectable()
export class ApiGatewayService {
  constructor(
    //- inject rabbitmq client đã đăng ký trong api-gateway.module.ts
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  //- xử lý tạo đơn hàng và bắn sự kiện qua rabbitmq
  createOrder(orderDto: CreateOrderDto) {
    console.log(
      '📦 [API Gateway] Đã nhận request tạo đơn hàng hợp lệ:',
      orderDto,
    );

    const orderId = Date.now();

    //- tạo event instance từ class OrderCreatedEvent
    const orderCreatedEvent = new OrderCreatedEvent(
      orderId,
      orderDto.productName,
      orderDto.price,
      orderDto.customerEmail,
    );

    //- phát sự kiện order_created tới rabbitmq bất đồng bộ (fire-and-forget)
    this.notificationClient.emit('order_created', orderCreatedEvent);

    return {
      message:
        'Tạo đơn hàng thành công, thông báo đang được gửi ngầm qua RabbitMQ!',
      orderId: orderId,
      data: orderDto,
    };
  }
}
