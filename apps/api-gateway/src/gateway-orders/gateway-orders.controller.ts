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
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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

  //- endpoint lấy chi tiết đơn hàng theo id
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID đơn hàng (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ResponseMessage('Lấy chi tiết đơn hàng thành công')
  @ApiCustomResponse({
    type: Order,
    description: 'Chi tiết thông tin đơn hàng',
  })
  async getOrderById(@Param('id') id: string): Promise<Order> {
    return await this.ordersService.getOrderById(id);
  }

  //- endpoint xóa mềm đơn hàng
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm đơn hàng khỏi hệ thống' })
  @ApiParam({
    name: 'id',
    description: 'ID đơn hàng cần xóa (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ResponseMessage('Xóa đơn hàng thành công')
  @ApiCustomResponse({ description: 'Xóa đơn hàng thành công' })
  async deleteOrder(@Param('id') id: string) {
    await this.ordersService.deleteOrder(id);
    return {
      deleted: true,
      id,
    };
  }

  //- endpoint khôi phục đơn hàng đã xóa mềm
  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục đơn hàng đã bị xóa mềm' })
  @ApiParam({
    name: 'id',
    description: 'ID đơn hàng cần khôi phục (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ResponseMessage('Khôi phục đơn hàng thành công')
  @ApiCustomResponse({ description: 'Khôi phục đơn hàng thành công' })
  async restoreOrder(@Param('id') id: string) {
    await this.ordersService.restoreOrder(id);
    return {
      restored: true,
      id,
    };
  }
}
