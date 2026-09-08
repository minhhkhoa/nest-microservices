import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextStore {
  correlationId?: string;
  serviceName?: string;
  [key: string]: unknown;
}

//- service quản lý ngữ cảnh bất đồng bộ của request sử dụng asynclocalstorage
@Injectable()
export class ContextService {
  private static readonly storage =
    new AsyncLocalStorage<RequestContextStore>();

  //- thực thi hàm callback bên trong một ngữ cảnh lưu trữ riêng biệt
  static run<T>(store: RequestContextStore, callback: () => T): T {
    return ContextService.storage.run(store, callback);
  }

  //- lấy toàn bộ dữ liệu ngữ cảnh hiện tại
  static getStore(): RequestContextStore | undefined {
    return ContextService.storage.getStore();
  }

  //- lấy mã correlation id từ ngữ cảnh hiện tại
  static getCorrelationId(): string | undefined {
    return ContextService.storage.getStore()?.correlationId;
  }

  //- lấy tên service từ ngữ cảnh hiện tại
  static getServiceName(): string | undefined {
    return ContextService.storage.getStore()?.serviceName;
  }

  //- các hàm instance hỗ trợ gọi qua nestjs dependency injection
  run<T>(store: RequestContextStore, callback: () => T): T {
    return ContextService.run(store, callback);
  }

  getStore(): RequestContextStore | undefined {
    return ContextService.getStore();
  }

  getCorrelationId(): string | undefined {
    return ContextService.getCorrelationId();
  }
}
