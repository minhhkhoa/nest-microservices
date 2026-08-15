import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

interface RmqModuleOptions {
  name: string;
  queue: string;
}

@Module({})
export class RmqModule {
  //- hàm động giúp đăng ký rmq client chỉ với 1 dòng lệnh
  static register({ name, queue }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://guest:guest@localhost:5672'],
              queue,
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
