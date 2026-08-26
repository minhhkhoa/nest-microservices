import { CreateOrderDto, Order } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  //- endpoint tạo đơn hàng mới
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    return await this.ordersService.createOrder(createOrderDto);
  }

  //- endpoint lấy danh sách đơn hàng
  @Get()
  async getOrders(): Promise<Order[]> {
    return await this.ordersService.getOrders();
  }
}
