import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  getCurrentDateString,
  getFormattedTimestamp,
  writeLogToFile,
} from '../utils';

interface RequestWithMeta {
  method?: string;
  url?: string;
  originalUrl?: string;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  user?: { id?: string | number };
}

//- interceptor ghi log vết và đo lường thời gian thực thi request api cả console và file
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithMeta>();

    if (!request || !request.method) {
      return next.handle();
    }

    const { method } = request;
    const url = request.originalUrl || request.url || '';
    const now = Date.now();
    const userId = request.user?.id ? `[User: ${request.user.id}]` : '[Guest]';

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

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.getResponse<{ statusCode?: number }>();
          const statusCode = response?.statusCode || 200;
          const duration = Date.now() - now;
          const timestamp = getFormattedTimestamp();
          const dateStr = getCurrentDateString();

          //- in log ra terminal console
          this.logger.log(
            `${method} ${url} ${statusCode} ${userId} +${duration}ms - IP: ${ip}`,
          );

          //- ghi dòng log chi tiết vào file http-yyyy-mm-dd.log
          const logLine = `[${timestamp}] [INFO] [HTTP] ${method} ${url} [Status: ${statusCode}] [Latency: ${duration}ms] [IP: ${ip}] ${userId} [Agent: ${userAgent}]`;
          writeLogToFile(`http-${dateStr}.log`, logLine);
        },
        error: (err: unknown) => {
          const duration = Date.now() - now;
          const timestamp = getFormattedTimestamp();
          const dateStr = getCurrentDateString();

          //- trích xuất mã lỗi và thông điệp lỗi
          const statusCode =
            typeof err === 'object' && err !== null && 'status' in err
              ? (err as { status: number }).status
              : 500;
          const errorMessage = err instanceof Error ? err.message : String(err);
          const stackTrace = err instanceof Error ? err.stack : String(err);

          //- in cảnh báo lỗi ra terminal console
          this.logger.error(
            `${method} ${url} ${statusCode} ${userId} +${duration}ms - IP: ${ip} - Message: ${errorMessage}`,
            stackTrace,
          );

          //- ghi chi tiết lỗi vào file http log và error log riêng
          const errorLogLine = `[${timestamp}] [ERROR] [HTTP] ${method} ${url} [Status: ${statusCode}] [Latency: ${duration}ms] [IP: ${ip}] ${userId} [Agent: ${userAgent}] - Message: ${errorMessage}\nStack: ${stackTrace}\n${'-'.repeat(80)}`;

          writeLogToFile(`http-${dateStr}.log`, errorLogLine);
          writeLogToFile(`error-${dateStr}.log`, errorLogLine);
        },
      }),
    );
  }
}
