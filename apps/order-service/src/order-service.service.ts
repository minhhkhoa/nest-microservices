import { BaseServiceAbstract, CreateOrderDto, Order } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderRepository } from './order.repository';

//- service xử lý nghiệp vụ đơn hàng kế thừa base service
@Injectable()
export class OrderServiceService extends BaseServiceAbstract<Order> {
  constructor(
    private readonly orderRepository: OrderRepository,

    //- inject rabbitmq client inventory_service đã đăng ký trong module
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryClient: ClientProxy,

    //- inject rabbitmq client notification_service đã đăng ký trong module
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {
    super(orderRepository);
  }

  //- hàm tạo và lưu đơn hàng mới sau khi kiểm tra kho và phát sự kiện thông báo
  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    //- bước 1: hỏi inventory-service qua rabbitmq xem còn hàng không
    const inventoryCheck = await firstValueFrom(
      this.inventoryClient.send<{
        available: boolean;
        stock: number;
        message: string;
      }>(
        { cmd: 'check_inventory' },
        { productName: createOrderDto.productName, quantity: 1 },
      ),
    );

    //- nếu hết hàng -> ném lỗi rpc để dừng lại ngay, không tạo đơn
    if (!inventoryCheck.available) {
      throw new RpcException(inventoryCheck.message);
    }

    //- bước 2: tạo và lưu đơn hàng mới vào csdl postgresql
    const order = await this.create(createOrderDto);

    const result = {
      message: 'Tạo đơn hàng qua RabbitMQ và lưu vào PostgreSQL thành công!',
      order,
    };

    //- bước 3: bắn event order_created sang notification-service theo kiểu fire-and-forget
    this.notificationClient.emit('order_created', result);

    return result;
  }
}
