import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as fs from 'fs';
import * as path from 'path';
import { Observable, throwError } from 'rxjs';

//- bộ lọc ngoại lệ toàn cục cho các microservice xử lý qua rabbitmq và tcp
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');
  private readonly logDir = path.resolve(process.cwd(), 'logs');

  constructor() {
    //- tự động tạo thư mục logs nếu chưa tồn tại
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  catch(exception: unknown, _host: ArgumentsHost): Observable<any> {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal microservice error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const resObj = response as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        error = (resObj.error as string) || exception.name;
      }
    } else if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      if (typeof rpcError === 'string') {
        message = rpcError;
        statusCode = HttpStatus.BAD_REQUEST;
        error = 'Bad Request';
      } else if (typeof rpcError === 'object' && rpcError !== null) {
        const rpcObj = rpcError as Record<string, unknown>;
        statusCode = (rpcObj.statusCode as number) || HttpStatus.BAD_REQUEST;
        message = (rpcObj.message as string) || 'RPC Error';
        error = (rpcObj.error as string) || 'Bad Request';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      //- nếu là lỗi không tìm thấy entity của typeorm
      if (exception.name === 'EntityNotFoundError') {
        statusCode = HttpStatus.NOT_FOUND;
        error = 'Not Found';
      } else if (exception.name === 'QueryFailedError') {
        statusCode = HttpStatus.BAD_REQUEST;
        error = 'Database Query Error';
      }
    }

    const timestamp = this.getFormattedTimestamp();
    const dateStr = this.getCurrentDateString();
    const stack =
      exception instanceof Error ? exception.stack : String(exception);

    //- ghi log lỗi microservice ra console
    this.logger.error(
      `[Microservice RPC] [Status: ${statusCode}] - Message: ${message}`,
      stack,
    );

    //- ghi chi tiết lỗi vào file error-yyyy-mm-dd.log
    const logLine = `[${timestamp}] [ERROR] [MICROSERVICE_RPC] [Status: ${statusCode}] - Message: ${message}\nStack: ${stack}\n${'-'.repeat(80)}`;
    this.writeLogToFile(`error-${dateStr}.log`, logLine);

    //- ném lỗi chuẩn hóa qua rpc để api gateway hoặc service gọi nhận được
    return throwError(() => ({
      statusCode,
      message,
      error,
      timestamp,
    }));
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
