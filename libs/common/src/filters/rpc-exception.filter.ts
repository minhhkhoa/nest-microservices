import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import {
  getCurrentDateString,
  getFormattedTimestamp,
  writeLogToFile,
} from '../utils';

//- bộ lọc ngoại lệ toàn cục cho các microservice xử lý qua rabbitmq và tcp
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

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

    const timestamp = getFormattedTimestamp();
    const dateStr = getCurrentDateString();
    const stack =
      exception instanceof Error ? exception.stack : String(exception);

    //- ghi log lỗi microservice ra console
    this.logger.error(
      `[Microservice RPC] [Status: ${statusCode}] - Message: ${message}`,
      stack,
    );

    //- ghi chi tiết lỗi vào file error-yyyy-mm-dd.log
    const logLine = `[${timestamp}] [ERROR] [MICROSERVICE_RPC] [Status: ${statusCode}] - Message: ${message}\nStack: ${stack}\n${'-'.repeat(80)}`;
    writeLogToFile(`error-${dateStr}.log`, logLine);

    //- ném lỗi chuẩn hóa qua rpc để api gateway hoặc service gọi nhận được
    return throwError(() => ({
      statusCode,
      message,
      error,
      timestamp,
    }));
  }
}
