import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from '@app/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller('orders')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  //- api post /orders để client gọi tạo đơn hàng với dto đã được validate
  @Post()
  createOrder(@Body() orderDto: CreateOrderDto) {
    return this.apiGatewayService.createOrder(orderDto);
  }
}
