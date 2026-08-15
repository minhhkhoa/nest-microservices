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
    //- client 1: kết nối tcp tới order-service (bài 2)

    ClientsModule.register([
      {
        name: 'ORDER_SERVICE', //- tên định danh để inject
        transport: Transport.TCP, //- sử dụng giao thức tcp
        options: {
          host: '127.0.0.1', //- địa chỉ ip
          port: 3001, //- cổng
        },
      },

      //- client 2: kết nối rabbitmq để bắn event sang notification-service (bài 4)
      {
        name: 'NOTIFICATION_SERVICE', //- tên định danh để inject
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'], //- url kết nối tới container rabbitmq
          queue: 'notification_queue', //- tên queue mà service này sẽ lắng nghe
          queueOptions: {
            durable: false, //- durable = false nghĩa là queue tạm thời trong lúc học tập
          },
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
