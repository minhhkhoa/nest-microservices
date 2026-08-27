import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationMetadata } from '../database/interfaces/pagination.interface';
import { RESPONSE_MESSAGE } from '../decorators/customize.decorator';

export interface ResponseFormat<T> {
  statusCode: number;
  message?: string;
  pagination?: PaginationMetadata;
  data: T;
}

//- interceptor tự động chuẩn hóa cấu trúc dữ liệu phản hồi http cho toàn bộ api
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((result: unknown): ResponseFormat<T> => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<{ statusCode?: number }>();
        const statusCode = response?.statusCode || 200;
        const message =
          this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
          '';

        //- nếu dữ liệu trả về có cấu trúc phân trang (data và pagination) thì bóc tách phẳng ra cùng cấp
        if (
          result !== null &&
          typeof result === 'object' &&
          'data' in result &&
          'pagination' in result
        ) {
          const paginatedResult = result as {
            data: T;
            pagination: PaginationMetadata;
          };
          return {
            statusCode,
            message,
            pagination: paginatedResult.pagination,
            data: paginatedResult.data,
          };
        }

        return {
          statusCode,
          message,
          data: result as T,
        };
      }),
    );
  }
}
