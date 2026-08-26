import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private readonly logDir = path.resolve(process.cwd(), 'logs');

  constructor() {
    //- tự động tạo thư mục logs nếu chưa tồn tại
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
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
          const timestamp = this.getFormattedTimestamp();
          const dateStr = this.getCurrentDateString();

          //- in log ra terminal console
          this.logger.log(
            `${method} ${url} ${statusCode} ${userId} +${duration}ms - IP: ${ip}`,
          );

          //- ghi dòng log chi tiết vào file http-yyyy-mm-dd.log
          const logLine = `[${timestamp}] [INFO] [HTTP] ${method} ${url} [Status: ${statusCode}] [Latency: ${duration}ms] [IP: ${ip}] ${userId} [Agent: ${userAgent}]`;
          this.writeLogToFile(`http-${dateStr}.log`, logLine);
        },
        error: (err: unknown) => {
          const duration = Date.now() - now;
          const timestamp = this.getFormattedTimestamp();
          const dateStr = this.getCurrentDateString();

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

          this.writeLogToFile(`http-${dateStr}.log`, errorLogLine);
          this.writeLogToFile(`error-${dateStr}.log`, errorLogLine);
        },
      }),
    );
  }

  //- lấy chuỗi ngày hiện tại định dạng yyyy-mm-dd để đặt tên file log
  private getCurrentDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //- lấy chuỗi thời gian hiện tại định dạng yyyy-mm-dd hh:mm:ss để ghi vào từng dòng log
  private getFormattedTimestamp(): string {
    const now = new Date();
    const date = this.getCurrentDateString();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${date} ${hours}:${minutes}:${seconds}`;
  }

  //- ghi nối dữ liệu vào file log bất đồng bộ không gây nghẽn luồng xử lý
  private writeLogToFile(filename: string, content: string): void {
    const filePath = path.join(this.logDir, filename);
    fs.appendFile(filePath, `${content}\n`, (err) => {
      if (err) {
        this.logger.warn(
          `Không thể ghi log vào file ${filename}: ${err.message}`,
        );
      }
    });
  }
}
