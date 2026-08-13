import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

/*
 * Giải thích: ClientsModule.register giúp api-gateway TẠO KẾT NỐI TCP tới order-service (127.0.0.1:3001) với tên định danh ORDER_SERVICE.
 */

@Module({
  imports: [
    //- đăng ký tcp client để giao tiếp với order-service tại cổng 3001
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE', //- tên định danh để inject
        transport: Transport.TCP, //- sử dụng giao thức tcp
        options: {
          host: '127.0.0.1', //- địa chỉ ip
          port: 3001, //- cổng
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
