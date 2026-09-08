import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_LOGS_CHANNEL = 'microservices:logs';
export const REDIS_LOGS_HISTORY_KEY = 'microservices:logs:history';

export interface LogPayload {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  context: string;
  correlationId?: string;
  message: string;
  type?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

//- service phát tán log qua redis pub/sub để web dashboard thu gom thời gian thực
@Injectable()
export class LogBroadcasterService implements OnModuleDestroy {
  private redisClient: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initRedis();
  }

  //- khởi tạo kết nối ioredis an toàn với cơ chế tự phục hồi
  private initRedis() {
    try {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = Number(process.env.REDIS_PORT || 6380);
      const password = process.env.REDIS_PASSWORD || undefined;

      this.redisClient = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; //- ngừng retry tạm thời nếu redis chưa bật để không spam terminal
          }
          return Math.min(times * 1000, 3000);
        },
      });

      this.redisClient.on('connect', () => {
        this.isConnected = true;
      });

      this.redisClient.on('error', () => {
        this.isConnected = false;
      });

      this.redisClient.connect().catch(() => {
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  //- phát log lên redis channel và lưu vào danh sách lịch sử
  broadcast(entry: LogPayload): void {
    if (!this.redisClient || !this.isConnected) {
      return;
    }

    try {
      const payloadString = JSON.stringify(entry);
      //- bắn sự kiện realtime tới các client đang theo dõi trên web
      this.redisClient
        .publish(REDIS_LOGS_CHANNEL, payloadString)
        .catch(() => {});
      //- lưu trữ 200 dòng log gần nhất để người dùng tải lại trang vẫn xem được
      this.redisClient
        .lpush(REDIS_LOGS_HISTORY_KEY, payloadString)
        .then(() => {
          this.redisClient
            ?.ltrim(REDIS_LOGS_HISTORY_KEY, 0, 199)
            .catch(() => {});
        })
        .catch(() => {});
    } catch {
      //- bỏ qua lỗi để không bao giờ ảnh hưởng luồng nghiệp vụ chính
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => {});
    }
  }
}
