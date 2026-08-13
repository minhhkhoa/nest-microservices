import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderServiceService } from './order-service.service';
import { CreateOrderDto } from '@app/common/dtos/order/create-order.dto';

@Controller()
export class OrderServiceController {
  constructor(private readonly orderService: OrderServiceService) {}

  /*
   * Thay các decorator @Post(), @Get() bằng @MessagePattern({ cmd: '...' }).
   * Khi bên ngoài gửi message TCP đúng nhãn cmd, hàm tương ứng sẽ được gọi và trả về kết quả.
   */

  //- lắng nghe lệnh create_order gửi tới qua giao thức tcp
  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);
    return {
      message: 'Tạo đơn hàng qua TCP và lưu vào PostgreSQL thành công!',
      order: order,
    };
  }

  //- lắng nghe lệnh get_orders gửi tới qua giao thức tcp
  @MessagePattern({ cmd: 'get_orders' })
  async getOrders() {
    return await this.orderService.getOrders();
  }
}
