import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

//- bộ lọc ngoại lệ toàn cục cho tầng http gateway bắt tất cả các loại lỗi
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');
  private readonly logDir = path.resolve(process.cwd(), 'logs');

  constructor() {
    //- tự động tạo thư mục logs nếu chưa tồn tại
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    //- xác định status code và message mặc định
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, unknown>;
        message =
          (responseObj.message as string | string[]) || exception.message;
        errorName = (responseObj.error as string) || exception.name;
      }
    } else if (typeof exception === 'object' && exception !== null) {
      const errObj = exception as Record<string, unknown>;

      //- xử lý lỗi rpc trả về từ microservice qua rabbitmq/tcp
      if (errObj.statusCode && typeof errObj.statusCode === 'number') {
        status = errObj.statusCode;
      } else if (errObj.status && typeof errObj.status === 'number') {
        status = errObj.status;
      }

      if (errObj.message) {
        message = errObj.message as string | string[];
      }
      if (errObj.error && typeof errObj.error === 'string') {
        errorName = errObj.error;
      }
    }

    const timestamp = this.getFormattedTimestamp();
    const dateStr = this.getCurrentDateString();
    const url = request?.url || '';
    const method = request?.method || '';
    const ip = request?.ip || request?.socket?.remoteAddress || 'unknown';
    const stack =
      exception instanceof Error ? exception.stack : String(exception);

    //- ghi log lỗi ra console terminal
    this.logger.error(
      `${method} ${url} [Status: ${status}] - IP: ${ip} - Message: ${JSON.stringify(message)}`,
      stack,
    );

    //- ghi chi tiết lỗi vào file error-yyyy-mm-dd.log
    const logLine = `[${timestamp}] [ERROR] [HTTP] ${method} ${url} [Status: ${status}] [IP: ${ip}] - Message: ${JSON.stringify(message)}\nStack: ${stack}\n${'-'.repeat(80)}`;
    this.writeLogToFile(`error-${dateStr}.log`, logLine);

    //- trả về response chuẩn hóa cho client
    response.status(status).json({
      statusCode: status,
      message,
      error: errorName,
      timestamp,
      path: url,
    });
  }

  //- lấy chuỗi ngày hiện tại định dạng yyyy-mm-dd
  private getCurrentDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //- lấy chuỗi thời gian hiện tại định dạng yyyy-mm-dd hh:mm:ss
  private getFormattedTimestamp(): string {
    const now = new Date();
    const date = this.getCurrentDateString();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${date} ${hours}:${minutes}:${seconds}`;
  }

  //- ghi log vào file bất đồng bộ
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
