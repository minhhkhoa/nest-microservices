import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

interface RmqModuleOptions {
  name: string;
  queue: string;
  url?: string;
}

@Module({})
export class RmqModule {
  //- hàm động giúp đăng ký rmq client đồng bộ
  static register({ name, queue, url }: RmqModuleOptions): DynamicModule {
    const rmqUrl = url || process.env.RABBITMQ_URL!;
    return {
      module: RmqModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.RMQ,
            options: {
              urls: [rmqUrl],
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

  //- hàm động giúp đăng ký rmq client bất đồng bộ qua configservice
  static registerAsync({
    name,
    queue,
    urlKey,
  }: {
    name: string;
    queue: string;
    urlKey?: string;
  }): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [
                  configService.get<string>(
                    urlKey || 'RABBITMQ_URL',
                    'amqp://guest:guest@localhost:5672',
                  ),
                ],
                queue,
                queueOptions: {
                  durable: true,
                },
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
