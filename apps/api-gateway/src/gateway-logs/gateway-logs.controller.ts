import { Public } from '@app/common';
import {
  REDIS_LOGS_CHANNEL,
  REDIS_LOGS_HISTORY_KEY,
} from '@app/common/logger/log-broadcaster.service';
import {
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleDestroy,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Response } from 'express';
import Redis from 'ioredis';
import { getLogsDashboardHtml } from './gateway-logs.template';

//- controller phục vụ giao diện web dashboard và stream log thời gian thực
@Controller('logs')
export class GatewayLogsController implements OnModuleDestroy {
  private redisSubscriber: Redis | null = null;
  private redisClient: Redis | null = null;

  constructor(
    @Inject('REDIS_LOGS_SUBSCRIBER') subscriber: Redis,
    @Inject('REDIS_LOGS_CLIENT') client: Redis,
  ) {
    this.redisSubscriber = subscriber;
    this.redisClient = client;

    if (this.redisSubscriber) {
      this.redisSubscriber.subscribe(REDIS_LOGS_CHANNEL).catch(() => {});
    }
  }

  //- trả về trang web dashboard hoàn chỉnh
  @Public()
  @ApiExcludeEndpoint()
  @Get()
  getDashboard(@Res() res: Response): void {
    res.type('text/html').send(getLogsDashboardHtml());
  }

  //- endpoint sse (server-sent events) đẩy log thời gian thực về trình duyệt
  @Public()
  @ApiExcludeEndpoint()
  @Get('stream')
  streamLogs(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    //- gửi ping heartbeat mỗi 15 giây để duy trì kết nối sse không bị timeout
    const heartbeatInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    const onMessage = (channel: string, message: string) => {
      if (channel === REDIS_LOGS_CHANNEL) {
        res.write(`data: ${message}\n\n`);
      }
    };

    if (this.redisSubscriber) {
      this.redisSubscriber.on('message', onMessage);
    }

    res.on('close', () => {
      clearInterval(heartbeatInterval);
      if (this.redisSubscriber) {
        this.redisSubscriber.off('message', onMessage);
      }
    });
  }

  //- lấy danh sách 200 dòng log gần nhất từ redis
  @Public()
  @ApiExcludeEndpoint()
  @Get('history')
  async getHistory(): Promise<unknown[]> {
    if (!this.redisClient) {
      return [];
    }
    try {
      const items = await this.redisClient.lrange(
        REDIS_LOGS_HISTORY_KEY,
        0,
        199,
      );
      return items
        .map((raw) => {
          try {
            return JSON.parse(raw) as unknown;
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  //- xóa sạch lịch sử log trong redis
  @Public()
  @ApiExcludeEndpoint()
  @Delete('history')
  async clearHistory(): Promise<{ success: boolean }> {
    if (this.redisClient) {
      try {
        await this.redisClient.del(REDIS_LOGS_HISTORY_KEY);
      } catch {
        //- bỏ qua nếu lỗi redis
      }
    }
    return { success: true };
  }

  async onModuleDestroy() {
    if (this.redisSubscriber) {
      await this.redisSubscriber.quit().catch(() => {});
    }
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => {});
    }
  }
}
