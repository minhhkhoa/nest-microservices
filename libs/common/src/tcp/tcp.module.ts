import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

interface TcpModuleOptions {
  name: string;
  port: number;
  host?: string;
}

@Module({})
export class TcpModule {
  //- hàm động giúp đăng ký tcp client đồng bộ
  static register({ name, port, host }: TcpModuleOptions): DynamicModule {
    return {
      module: TcpModule,
      imports: [
        ClientsModule.register([
          {
            name,
            transport: Transport.TCP,
            options: {
              host: host || process.env[`${name}_HOST`] || '127.0.0.1',
              port: port || Number(process.env[`${name}_PORT`]) || 3000,
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }

  //- hàm động giúp đăng ký tcp client bất đồng bộ qua configservice
  static registerAsync({
    name,
    portKey,
    hostKey,
  }: {
    name: string;
    portKey: string;
    hostKey?: string;
  }): DynamicModule {
    return {
      module: TcpModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.TCP,
              options: {
                host: configService.get<string>(
                  hostKey || `${name}_HOST`,
                  '127.0.0.1',
                ),
                port: Number(configService.get<number>(portKey, 3000)),
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
