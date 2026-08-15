import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

interface TcpModuleOptions {
  name: string;
  port: number;
}

@Module({})
export class TcpModule {
  //- hàm động giúp đăng ký tcp client chỉ với 1 dòng lệnh
  static register({ name, port }: TcpModuleOptions): DynamicModule {
    return {
      module: TcpModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.TCP,
            options: {
              host: '127.0.0.1',
              port,
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
