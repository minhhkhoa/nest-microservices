import { Injectable, LoggerService, Optional } from '@nestjs/common';
import { execSync } from 'child_process';
import pino, { Logger as PinoInstance } from 'pino';
import { ContextService } from '../context/context.service';
import { LogBroadcasterService, LogPayload } from './log-broadcaster.service';

//- tự động kích hoạt bảng mã utf-8 (chcp 65001) trên windows để hiển thị tiếng việt có dấu rõ nét
if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch {
    //- bỏ qua nếu môi trường terminal không hỗ trợ lệnh chcp
  }
}

//- service ghi log chuẩn cấu trúc kết hợp xuất terminal 1 dòng gọn gàng và phát tán lên web dashboard
@Injectable()
export class AppLoggerService implements LoggerService {
  private pinoLogger: PinoInstance;
  private contextName = 'Application';
  private defaultServiceName = process.env.SERVICE_NAME || 'nest-microservice';
  private broadcaster: LogBroadcasterService;

  constructor(@Optional() broadcaster?: LogBroadcasterService) {
    this.broadcaster = broadcaster || new LogBroadcasterService();
    const logLevel = process.env.LOG_LEVEL || 'info';

    //- khởi tạo pino ở dạng json tiêu chuẩn
    this.pinoLogger = pino({
      level: logLevel,
      timestamp: pino.stdTimeFunctions.isoTime,
    });
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

  //- format dòng log in ra terminal trên 1 dòng duy nhất có màu sắc rõ đẹp
  private printConsoleLine(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: string,
    trace?: string,
  ): void {
    if (process.env.NODE_ENV === 'production') {
      return; //- production đã có pino json ra stdout
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const correlationId = ContextService.getCorrelationId();
    const serviceName =
      ContextService.getServiceName() || this.defaultServiceName;
    const ctx = context || this.contextName;

    //- màu sắc mã ansi cho từng cấp độ log
    const colors = {
      info: '\x1b[32m[INFO ]\x1b[0m',
      warn: '\x1b[33m[WARN ]\x1b[0m',
      error: '\x1b[31m[ERROR]\x1b[0m',
      debug: '\x1b[34m[DEBUG]\x1b[0m',
    };

    const timeTag = `\x1b[90m${timeStr}\x1b[0m`;
    const serviceTag = `\x1b[35m[${serviceName}]\x1b[0m`;
    const ctxTag = `\x1b[36m[${ctx}]\x1b[0m`;
    const traceTag = correlationId ? `\x1b[33m[${correlationId}]\x1b[0m` : '';

    const prefix = [timeTag, colors[level], serviceTag, ctxTag, traceTag]
      .filter(Boolean)
      .join(' ');
    console.log(`${prefix} ${message}`);

    if (trace) {
      console.log(`\x1b[90m${trace}\x1b[0m`);
    }
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

    this.printConsoleLine('info', msgStr, meta.context);
    this.pinoLogger.info(meta, msgStr);

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

    this.printConsoleLine('error', msgStr, meta.context, trace);
    this.pinoLogger.error({ ...meta, stack: trace }, msgStr);

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

    this.printConsoleLine('warn', msgStr, meta.context);
    this.pinoLogger.warn(meta, msgStr);

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

    this.printConsoleLine('debug', msgStr, meta.context);
    this.pinoLogger.debug(meta, msgStr);

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
    this.debug(message, context);
  }

  //- ghi log mức lỗi nghiêm trọng
  fatal(message: unknown, trace?: string, context?: string): void {
    this.error(message, trace, context);
  }

  //- ghi log cấu trúc chuyên dụng cho http request tại api gateway
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

    this.printConsoleLine('info', msg, 'HTTP');
    this.pinoLogger.info(
      { ...contextMeta, type: 'HTTP_REQUEST', ...meta },
      msg,
    );

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

  //- ghi log cấu trúc chuyên dụng cho rpc request tại microservices
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

    this.printConsoleLine(meta.success ? 'info' : 'error', msg, 'RPC');
    this.pinoLogger.info({ ...contextMeta, type: 'RPC_REQUEST', ...meta }, msg);

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
