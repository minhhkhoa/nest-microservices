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
    return await this.orderService.findAll(condition);
  }

  //- lấy chi tiết đơn hàng theo id
  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrderById(@Payload() data: { id: number }): Promise<Order> {
    return await this.orderService.findByIdOrFail(data.id);
  }

  //- xóa mềm đơn hàng
  @MessagePattern({ cmd: 'delete_order' })
  async deleteOrder(@Payload() data: { id: number }): Promise<boolean> {
    return await this.orderService.remove(data.id);
  }

  //- khôi phục đơn hàng đã xóa mềm
  @MessagePattern({ cmd: 'restore_order' })
  async restoreOrder(@Payload() data: { id: number }): Promise<boolean> {
    return await this.orderService.restore(data.id);
  }
}
