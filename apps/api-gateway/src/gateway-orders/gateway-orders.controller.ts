import {
  ApiCustomResponse,
  ApiPaginationQuery,
  ApiPaginationResponse,
  CreateOrderDto,
  Order,
  QueryFiltered,
  ResponseMessage,
} from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayOrdersService } from './gateway-orders.service';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class GatewayOrdersController {
  constructor(private readonly ordersService: GatewayOrdersService) {}

  //- endpoint tạo đơn hàng mới
  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiBody({
    type: CreateOrderDto,
    description: 'Dữ liệu thông tin tạo đơn hàng',
  })
  @ResponseMessage('Tạo đơn hàng thành công')
  @ApiCustomResponse({
    type: Order,
    status: 201,
    description: 'Tạo đơn hàng thành công',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    return await this.ordersService.createOrder(createOrderDto);
  }

  //- endpoint lấy danh sách đơn hàng có hỗ trợ phân trang, lọc và tìm kiếm
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn hàng (hỗ trợ phân trang, lọc và tìm kiếm)',
  })
  @ApiPaginationQuery()
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  @ApiPaginationResponse({
    type: Order,
    description: 'Lấy danh sách đơn hàng phân trang thành công',
  })
  async getOrders(
    @QueryFiltered() condition: ConditionQuery<Order>,
  ): Promise<FindAllResponse<Order>> {
    return await this.ordersService.getOrders(condition);
  }
}
