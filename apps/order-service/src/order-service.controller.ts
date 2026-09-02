import { CreateOrderDto, Order } from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderServiceService } from './order-service.service';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderService: OrderServiceService) {}

  //- lắng nghe lệnh create_order gửi tới qua rabbitmq
  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  //- lắng nghe lệnh get_orders gửi tới qua rabbitmq kèm bộ lọc/phân trang
  @MessagePattern({ cmd: 'get_orders' })
  async getOrders(
    @Payload() condition?: ConditionQuery<Order>,
  ): Promise<FindAllResponse<Order>> {
    return await this.orderService.getOrders(condition);
  }

  //- lấy chi tiết đơn hàng theo id
  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrderById(@Payload() data: { id: string }): Promise<Order> {
    return await this.orderService.getOrderById(data.id);
  }

  //- xóa mềm một hoặc nhiều đơn hàng (nhận id đơn lẻ hoặc mảng ids)
  @MessagePattern({ cmd: 'delete_order' })
  async deleteOrder(
    @Payload()
    data: { id?: string | string[]; ids?: string[] } | string | string[],
  ): Promise<boolean> {
    const ids =
      typeof data === 'object' && !Array.isArray(data)
        ? (data.ids ?? data.id ?? [])
        : data;
    return await this.orderService.deleteOrder(ids);
  }

  //- khôi phục một hoặc nhiều đơn hàng đã xóa mềm (nhận id đơn lẻ hoặc mảng ids)
  @MessagePattern({ cmd: 'restore_order' })
  async restoreOrder(
    @Payload()
    data: { id?: string | string[]; ids?: string[] } | string | string[],
  ): Promise<boolean> {
    const ids =
      typeof data === 'object' && !Array.isArray(data)
        ? (data.ids ?? data.id ?? [])
        : data;
    return await this.orderService.restoreOrder(ids);
  }
}
