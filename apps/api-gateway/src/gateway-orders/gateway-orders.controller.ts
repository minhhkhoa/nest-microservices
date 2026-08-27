import {
  CreateOrderDto,
  Order,
  QueryFiltered,
  ResponseMessage,
} from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayOrdersService } from './gateway-orders.service';

@Controller('orders')
export class GatewayOrdersController {
  constructor(private readonly ordersService: GatewayOrdersService) {}

  //- endpoint tạo đơn hàng mới
  @Post()
  @ResponseMessage('Tạo đơn hàng thành công')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    return await this.ordersService.createOrder(createOrderDto);
  }

  //- endpoint lấy danh sách đơn hàng có hỗ trợ phân trang, lọc và tìm kiếm
  @Get()
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  async getOrders(
    @QueryFiltered() condition: ConditionQuery<Order>,
  ): Promise<FindAllResponse<Order>> {
    return await this.ordersService.getOrders(condition);
  }
}
