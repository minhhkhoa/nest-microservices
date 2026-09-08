import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logger/app-logger.service';

interface RequestWithMeta {
  method?: string;
  url?: string;
  originalUrl?: string;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  user?: { id?: string | number };
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

//- che giấu các trường nhạy cảm như mật khẩu hoặc token để bảo mật
const maskSensitiveData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }
  const result: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'pass', 'refreshToken', 'token', 'secret'];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      result[key] = '******';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = maskSensitiveData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

//- interceptor ghi log vết và đo lường thời gian thực thi request api qua pino logger
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithMeta>();

    if (!request || !request.method) {
      return next.handle();
    }

    const { method } = request;
    const url = request.originalUrl || request.url || '';
    const now = Date.now();
    const userId = request.user?.id ? String(request.user.id) : undefined;

    //- lấy địa chỉ ip của client
    const rawIp =
      request.headers?.['x-forwarded-for'] ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown';
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

    //- lấy thông tin user agent
    const rawUserAgent = request.headers?.['user-agent'] || 'unknown';
    const userAgent = Array.isArray(rawUserAgent)
      ? rawUserAgent[0]
      : rawUserAgent;

    //- trích xuất dữ liệu body an toàn
    const requestBody = maskSensitiveData(request.body);

    return next.handle().pipe(
      tap({
        next: (responseBody: unknown) => {
          const response = ctx.getResponse<{ statusCode?: number }>();
          const statusCode = response?.statusCode || 200;
          const durationMs = Date.now() - now;

          //- ghi log http có cấu trúc kèm request body và response data lên dashboard
          this.logger.logHttpRequest({
            method,
            url,
            statusCode,
            durationMs,
            ip,
            userAgent,
            userId,
            requestBody: requestBody || undefined,
            responseData: maskSensitiveData(responseBody) || undefined,
          });
        },
        error: (err: unknown) => {
          const durationMs = Date.now() - now;

          //- trích xuất mã lỗi và thông điệp lỗi
          const statusCode =
            typeof err === 'object' && err !== null && 'status' in err
              ? (err as { status: number }).status
              : 500;
          const errorMessage = err instanceof Error ? err.message : String(err);
          const stackTrace = err instanceof Error ? err.stack : undefined;

          //- ghi log lỗi http có cấu trúc ra stdout
          this.logger.error(
            {
              type: 'HTTP_REQUEST_ERROR',
              method,
              url,
              statusCode,
              durationMs,
              ip,
              userAgent,
              userId,
              errorMessage,
              requestBody: requestBody || undefined,
            },
            stackTrace,
            'HTTP',
          );
        },
      }),
    );
  }
}
