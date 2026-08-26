import { ModuleMetadata, Type } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

//- cấu hình tùy chọn kết nối redis
export interface RedisModuleOptions extends RedisOptions {
  keyPrefix?: string;
  isGlobal?: boolean;
}

//- factory interface cho cấu hình redis bất đồng bộ
export interface RedisOptionsFactory {
  createRedisOptions(): Promise<RedisModuleOptions> | RedisModuleOptions;
}

//- cấu hình đăng ký redis bất đồng bộ từ configservice
export interface RedisModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  isGlobal?: boolean;
  useExisting?: Type<RedisOptionsFactory>;
  useClass?: Type<RedisOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}
