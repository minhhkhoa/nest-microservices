import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  //- hàm đăng ký client kết nối rabbitmq để gửi tin nhắn (dành cho client/producer)
  static register({ name }: { name: string }): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.register([
          {
            name: name, //- tên định danh của client (ví dụ: NOTIFICATION_SERVICE)
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://guest:guest@localhost:5672'], //- url kết nối rabbitmq server
              queue: `${name}_QUEUE`, //- tên queue gửi tới
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
