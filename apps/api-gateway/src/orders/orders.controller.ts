import { CreateOrderDto, Order, ResponseMessage } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  //- endpoint tạo đơn hàng mới
  @Post()
  @ResponseMessage('Tạo đơn hàng thành công')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    return await this.ordersService.createOrder(createOrderDto);
  }

  //- endpoint lấy danh sách đơn hàng
  @Get()
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  async getOrders(): Promise<Order[]> {
    return await this.ordersService.getOrders();
  }
}
