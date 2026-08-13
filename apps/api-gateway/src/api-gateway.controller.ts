import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { CreateOrderDto } from '@app/common/dtos/order/create-order.dto';

@Controller('orders')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  //- đón request http post /orders từ client
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.apiGatewayService.createOrder(createOrderDto);
  }

  //- đón request http get /orders từ client
  @Get()
  async getOrders() {
    return await this.apiGatewayService.getOrders();
  }
}

/**
 * - Controller này tiếp nhận request HTTP:
 *      • POST /orders (tạo đơn hàng)
 *      • GET /orders (lấy danh sách đơn hàng)
 *   Sau đó chuyển tiếp (proxy) yêu cầu qua TCP tới order-service thông qua ApiGatewayService.
 */
