import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
  RedisOptionsFactory,
} from './redis.interface';
import { REDIS_OPTIONS, RedisService } from './redis.service';

//- module redis dùng chung hỗ trợ cấu hình tĩnh và bất đồng bộ
@Global()
@Module({})
export class RedisModule {
  //- đăng ký cấu hình tĩnh
  static register(options?: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      global: options?.isGlobal ?? true,
      providers: [
        {
          provide: REDIS_OPTIONS,
          useValue: options,
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }

  //- đăng ký cấu hình bất đồng bộ từ configservice
  static registerAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      global: options.isGlobal ?? true,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), RedisService],
      exports: [RedisService],
    };
  }

  private static createAsyncProviders(
    options: RedisModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: REDIS_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useExisting || options.useClass) {
      const injectToken = (options.useExisting ||
        options.useClass) as Type<RedisOptionsFactory>;

      return [
        {
          provide: REDIS_OPTIONS,
          useFactory: async (optionsFactory: RedisOptionsFactory) =>
            await optionsFactory.createRedisOptions(),
          inject: [injectToken],
        },
        ...(options.useClass
          ? [
              {
                provide: options.useClass,
                useClass: options.useClass,
              },
            ]
          : []),
      ];
    }

    return [];
  }
}
