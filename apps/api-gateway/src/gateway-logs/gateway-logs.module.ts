import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { GatewayLogsController } from './gateway-logs.controller';

//- module quản lý endpoint web log dashboard và kết nối redis subscriber
@Module({
  imports: [ConfigModule],
  controllers: [GatewayLogsController],
  providers: [
    {
      provide: 'REDIS_LOGS_SUBSCRIBER',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = Number(configService.get<number>('REDIS_PORT', 6380));
        const password =
          configService.get<string>('REDIS_PASSWORD') || undefined;

        return new Redis({
          host,
          port,
          password,
          retryStrategy: (times) =>
            times > 3 ? null : Math.min(times * 1000, 3000),
        });
      },
    },
    {
      provide: 'REDIS_LOGS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = Number(configService.get<number>('REDIS_PORT', 6380));
        const password =
          configService.get<string>('REDIS_PASSWORD') || undefined;

        return new Redis({
          host,
          port,
          password,
          retryStrategy: (times) =>
            times > 3 ? null : Math.min(times * 1000, 3000),
        });
      },
    },
  ],
})
export class GatewayLogsModule {}
