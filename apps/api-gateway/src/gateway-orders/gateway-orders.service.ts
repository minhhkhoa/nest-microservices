import { CreateOrderDto, Order } from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayOrdersService {
  constructor(
    //- inject rabbitmq client order_service đã đăng ký trong module
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,

    //- inject rabbitmq client notification_service đã đăng ký trong module
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,

    //- inject rabbitmq client inventory_service đã đăng ký trong module
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryClient: ClientProxy,
  ) {}

  //- gửi request tạo đơn hàng qua rabbitmq rpc và chờ phản hồi từ order-service
  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    //- bước 1: hỏi inventory-service qua rabbitmq xem còn hàng không (request-response qua send)
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

    //- nếu hết hàng -> ném lỗi và dừng lại ngay, không tạo đơn
    if (!inventoryCheck.available) {
      throw new BadRequestException(inventoryCheck.message);
    }

    //- bước 2: gọi sang order-service qua rabbitmq để lưu database (chờ kết quả)
    const result: { message: string; order: Order } = await firstValueFrom(
      this.orderClient.send({ cmd: 'create_order' }, createOrderDto),
    );

    //- bước 3: bắn event order_created sang rabbitmq theo kiểu fire-and-forget (không cần await chờ phản hồi)
    this.notificationClient.emit('order_created', result);

    return result;
  }

  //- gửi request lấy danh sách đơn hàng qua rabbitmq kèm theo condition phân trang
  async getOrders(
    condition?: ConditionQuery<Order>,
  ): Promise<FindAllResponse<Order>> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'get_orders' }, condition || {}),
    );
  }
}
