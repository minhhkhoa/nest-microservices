import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import Redis, { type Redis as RedisClient, type RedisOptions } from 'ioredis';
import type { RedisModuleOptions } from './redis.interface';

export const REDIS_OPTIONS = 'REDIS_OPTIONS';

//- dịch vụ quản lý và tương tác redis tập trung dùng chung cho toàn bộ hệ thống
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClient;

  constructor(
    @Optional()
    @Inject(REDIS_OPTIONS)
    private readonly options?: RedisModuleOptions,
  ) {
    this.initClient();
  }

  //- khởi tạo kết nối tới redis
  private initClient(): void {
    const rawOptions = this.options || {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6380', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    };
    const { isGlobal: _isGlobal, ...redisOptions } = rawOptions;

    const config: RedisOptions = {
      ...redisOptions,
      retryStrategy: (times: number) => {
        //- tự động thử lại kết nối sau tối đa 3 giây nếu redis chưa khởi động
        return Math.min(times * 200, 3000);
      },
    };

    this.client = new Redis(config);

    this.client.on('connect', () => {
      this.logger.log(
        `Đã kết nối thành công tới Redis (${config.host || 'localhost'}:${config.port || 6380})`,
      );
    });

    this.client.on('error', (err: Error) => {
      this.logger.warn(`Cảnh báo kết nối Redis: ${err.message}`);
    });
  }

  //- lấy instance redis client gốc khi cần thực thi các lệnh đặc thù
  getClient(): RedisClient {
    return this.client;
  }

  //- đóng kết nối an toàn khi module bị hủy
  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Đã đóng kết nối Redis an toàn');
    }
  }

  // ==========================================
  // CÁC HÀM XỬ LÝ CACHE & KEY-VALUE THÔNG DỤNG
  // ==========================================

  //- lấy giá trị chuỗi theo key
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  //- lấy và tự động parse json theo kiểu dữ liệu t
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  //- lưu giá trị chuỗi (hỗ trợ đặt thời gian sống ttl theo giây)
  async set(
    key: string,
    value: string | number,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return await this.client.set(key, String(value), 'EX', ttlSeconds);
    }
    return await this.client.set(key, String(value));
  }

  //- lưu đối tượng json (hỗ trợ ttl theo giây)
  async setJson<T>(
    key: string,
    data: T,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    const jsonString = JSON.stringify(data);
    return await this.set(key, jsonString, ttlSeconds);
  }

  //- xóa một hoặc nhiều key
  async del(...keys: string[]): Promise<number> {
    if (!keys || keys.length === 0) return 0;
    return await this.client.del(...keys);
  }

  //- xóa các key theo pattern (ví dụ: 'cache:products:*')
  async delByPattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      return await this.client.del(...keys);
    }
    return 0;
  }

  //- kiểm tra sự tồn tại của key
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  //- đặt thời gian hết hạn cho key (theo giây)
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  //- lấy thời gian sống còn lại của key
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  //- tăng giá trị biến đếm lên 1 đơn vị
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  //- giảm giá trị biến đếm đi 1 đơn vị
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }
}
