import { CreateOrderDto, Order } from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayOrdersService {
  constructor(
    //- inject rabbitmq client order_service đã đăng ký trong module
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  //- chuyển tiếp request tạo đơn hàng sang order-service qua rabbitmq rpc
  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'create_order' }, createOrderDto),
    );
  }

  //- gửi request lấy danh sách đơn hàng qua rabbitmq kèm theo condition phân trang
  async getOrders(
    condition?: ConditionQuery<Order>,
  ): Promise<FindAllResponse<Order>> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'get_orders' }, condition || {}),
    );
  }

  //- lấy chi tiết đơn hàng theo id
  async getOrderById(id: string): Promise<Order> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'get_order_by_id' }, { id }),
    );
  }

  //- xóa mềm một hoặc nhiều đơn hàng (nhận 1 id hoặc mảng ids)
  async deleteOrder(ids: string | string[]): Promise<boolean> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'delete_order' }, { ids }),
    );
  }

  //- khôi phục một hoặc nhiều đơn hàng đã xóa mềm (nhận 1 id hoặc mảng ids)
  async restoreOrder(ids: string | string[]): Promise<boolean> {
    return await firstValueFrom(
      this.orderClient.send({ cmd: 'restore_order' }, { ids }),
    );
  }
}
