/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import {
  ConsoleLogger,
  Injectable,
  LoggerService,
  Optional,
} from '@nestjs/common';
import { LogBroadcasterService, LogPayload } from './log-broadcaster.service';
import { ContextService } from './context.service';

//- service ghi log chuẩn cấu trúc, kết hợp console logger mặc định của nestjs và phát tán lên web dashboard qua redis
@Injectable()
export class AppLoggerService implements LoggerService {
  private contextName = 'Application';
  private defaultServiceName = process.env.SERVICE_NAME || 'nest-microservice';
  private broadcaster: LogBroadcasterService;
  //- console logger chuẩn mặc định của nestjs để hiển thị thông điệp hệ thống
  private readonly nestConsoleLogger = new ConsoleLogger();

  constructor(@Optional() broadcaster?: LogBroadcasterService) {
    this.broadcaster = broadcaster || new LogBroadcasterService();
  }

  //- thiết lập context cho từng module hoặc service gọi đến logger
  setContext(context: string): this {
    this.contextName = context;
    return this;
  }

  //- thiết lập tên dịch vụ mặc định cho service
  setServiceName(name: string): this {
    this.defaultServiceName = name;
    return this;
  }

  //- gom các trường dữ liệu ngữ cảnh cơ bản như correlation id và tên service
  private getContextMetadata(contextOverride?: string) {
    const correlationId = ContextService.getCorrelationId();
    const serviceName =
      ContextService.getServiceName() || this.defaultServiceName;
    return {
      context: contextOverride || this.contextName,
      service: serviceName,
      ...(correlationId ? { correlationId } : {}),
    };
  }

  //- phát log lên redis cho web dashboard
  private dispatchToDashboard(payload: LogPayload): void {
    this.broadcaster.broadcast(payload);
  }

  //- ghi log mức thông tin thông thường
  log(message: unknown, context?: string): void {
    const meta = this.getContextMetadata(context);
    const msgStr =
      typeof message === 'object' && message !== null
        ? JSON.stringify(message)
        : String(message);

    //- in ra terminal theo định dạng chuẩn của nestjs cho các thông điệp hệ thống
    if (meta.context !== 'HTTP' && meta.context !== 'RPC') {
      this.nestConsoleLogger.log(msgStr, meta.context);
    }

    this.dispatchToDashboard({
      timestamp: new Date().toISOString(),
      level: 'info',
      service: meta.service,
      context: meta.context,
      correlationId: meta.correlationId,
      message: msgStr,
      details:
        typeof message === 'object' && message !== null
          ? (message as Record<string, unknown>)
          : undefined,
    });
  }

  //- ghi log mức cảnh báo lỗi
  error(message: unknown, trace?: string, context?: string): void {
    const meta = this.getContextMetadata(context);
    const msgStr =
      typeof message === 'object' && message !== null
        ? JSON.stringify(message)
        : String(message);

    if (meta.context !== 'HTTP' && meta.context !== 'RPC') {
      this.nestConsoleLogger.error(msgStr, trace, meta.context);
    }

    this.dispatchToDashboard({
      timestamp: new Date().toISOString(),
      level: 'error',
      service: meta.service,
      context: meta.context,
      correlationId: meta.correlationId,
      message: msgStr,
      stack: trace,
      details:
        typeof message === 'object' && message !== null
          ? (message as Record<string, unknown>)
          : undefined,
    });
  }

  //- ghi log mức cảnh báo
  warn(message: unknown, context?: string): void {
    const meta = this.getContextMetadata(context);
    const msgStr =
      typeof message === 'object' && message !== null
        ? JSON.stringify(message)
        : String(message);

    if (meta.context !== 'HTTP' && meta.context !== 'RPC') {
      this.nestConsoleLogger.warn(msgStr, meta.context);
    }

    this.dispatchToDashboard({
      timestamp: new Date().toISOString(),
      level: 'warn',
      service: meta.service,
      context: meta.context,
      correlationId: meta.correlationId,
      message: msgStr,
      details:
        typeof message === 'object' && message !== null
          ? (message as Record<string, unknown>)
          : undefined,
    });
  }

  //- ghi log mức gỡ lỗi
  debug(message: unknown, context?: string): void {
    const meta = this.getContextMetadata(context);
    const msgStr =
      typeof message === 'object' && message !== null
        ? JSON.stringify(message)
        : String(message);

    if (meta.context !== 'HTTP' && meta.context !== 'RPC') {
      this.nestConsoleLogger.debug(msgStr, meta.context);
    }

    this.dispatchToDashboard({
      timestamp: new Date().toISOString(),
      level: 'debug',
      service: meta.service,
      context: meta.context,
      correlationId: meta.correlationId,
      message: msgStr,
      details:
        typeof message === 'object' && message !== null
          ? (message as Record<string, unknown>)
          : undefined,
    });
  }

  //- ghi log mức chi tiết
  verbose(message: unknown, context?: string): void {
    if (context !== 'HTTP' && context !== 'RPC') {
      this.nestConsoleLogger.verbose(String(message), context);
    }
    this.debug(message, context);
  }

  //- ghi log mức lỗi nghiêm trọng
  fatal(message: unknown, trace?: string, context?: string): void {
    if (context !== 'HTTP' && context !== 'RPC') {
      this.nestConsoleLogger.fatal(String(message), trace, context);
    }
    this.error(message, trace, context);
  }

  //- ghi log cấu trúc chuyên dụng cho http request tại api gateway đẩy lên web dashboard
  logHttpRequest(meta: {
    method: string;
    url: string;
    statusCode: number;
    durationMs: number;
    ip: string;
    userAgent: string;
    userId?: string;
    requestBody?: unknown;
    responseData?: unknown;
  }): void {
    const contextMeta = this.getContextMetadata('HTTP');
    const msg = `HTTP ${meta.method} ${meta.url} [Status: ${meta.statusCode}] +${meta.durationMs}ms - IP: ${meta.ip}`;

    const level =
      meta.statusCode >= 500
        ? 'error'
        : meta.statusCode >= 400
          ? 'warn'
          : 'info';

    this.dispatchToDashboard({
      timestamp: new Date().toISOString(),
      level,
      service: contextMeta.service,
      context: 'HTTP',
      correlationId: contextMeta.correlationId,
      type: 'HTTP_REQUEST',
      message: msg,
      details: meta,
    });
  }

  //- ghi log cấu trúc chuyên dụng cho rpc request tại microservices đẩy lên web dashboard
  logRpcRequest(meta: {
    pattern: string;
    transport: 'RMQ' | 'TCP';
    durationMs: number;
    success: boolean;
    error?: string;
    payload?: unknown;
    result?: unknown;
  }): void {
    const contextMeta = this.getContextMetadata('RPC');
    const statusText = meta.success ? 'SUCCESS' : 'FAILED';
    const msg = `[${meta.transport}] ${meta.pattern} ${statusText} +${meta.durationMs}ms${meta.error ? ` - Error: ${meta.error}` : ''}`;

    this.dispatchToDashboard({
      timestamp: new Date().toISOString(),
      level: meta.success ? 'info' : 'error',
      service: contextMeta.service,
      context: 'RPC',
      correlationId: contextMeta.correlationId,
      type: 'RPC_REQUEST',
      message: msg,
      details: meta,
    });
  }
}
