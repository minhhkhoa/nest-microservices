import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';
import { OrderServiceService } from './order-service.service';

@Controller('orders')
export class OrderServiceController {
  constructor(private readonly orderService: OrderServiceService) {}

  //- api post /orders tạo đơn hàng mới và lưu vào postgresql
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(createOrderDto);
    return {
      message: 'Tạo đơn hàng và lưu vào PostgreSQL thành công!',
      order: order,
    };
  }

  //- api get /orders lấy danh sách đơn hàng đã lưu trong postgresql
  @Get()
  async getOrders() {
    return await this.orderService.getOrders();
  }
}
