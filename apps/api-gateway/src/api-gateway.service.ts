import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '@app/common/dtos/order/create-order.dto';
import { Order } from '@app/common/entities/order/order.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    //- inject tcp client order_service đã đăng ký trong module
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  //- gửi request tạo đơn hàng qua tcp và chờ phản hồi từ order-service
  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'create_order' }, createOrderDto), //- gọi sang order-service.controller.createOrder thông qua tcp
    );
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
