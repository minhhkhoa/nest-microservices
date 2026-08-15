import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '@app/common/dtos/order/create-order.dto';
import { Order } from '@app/common/entities/order/order.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    //- inject tcp client order_service đã đăng ký trong module
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,

    //- inject rabbitmq client notification_service đã đăng ký trong module
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,

    //- inject rabbitmq client inventory_service đã đăng ký trong module
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryClient: ClientProxy,
  ) {}

  //- gửi request tạo đơn hàng qua tcp và chờ phản hồi từ order-service
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

    //- bước 2: gọi tcp sang order-service lưu database (chờ kết quả)
    const result: { message: string; order: Order } = await firstValueFrom(
      this.orderClient.send({ cmd: 'create_order' }, createOrderDto), //- gọi sang order-service.controller.createOrder thông qua tcp
    );

    //- bước 3: bắn event order_created sang rabbitmq theo kiểu fire-and-forget (không cần await chờ phản hồi)
    this.notificationClient.emit('order_created', result);

    /**
     * Note: - emit() vs send()
     *     • send() => yêu cầu - phản hồi (phải chờ nhau)
     *     • emit() => Publish-Subscribe (không cần chờ đợi, bắn xong là xong)
     */

    return result;
  }

  //- gửi request lấy danh sách đơn hàng qua tcp
  async getOrders(): Promise<Order[]> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'get_orders' }, {}),
    );
  }
}

/**
 * Hàm this.orderClient.send(pattern, payload) gửi dữ liệu qua TCP và trả về một Observable.
 * Dùng firstValueFrom() để chuyển đổi sang Promise giúp hàm async/await nhận kết quả trả về.
 */
