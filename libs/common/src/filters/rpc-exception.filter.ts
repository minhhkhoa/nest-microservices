import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { ContextService } from '../context/context.service';
import { AppLoggerService } from '../logger/app-logger.service';

//- bộ lọc ngoại lệ toàn cục cho các microservice xử lý qua rabbitmq và tcp
@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger: AppLoggerService;

  constructor(@Optional() logger?: AppLoggerService) {
    this.logger = logger || new AppLoggerService();
    this.logger.setContext('RpcExceptionFilter');
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

    const stack =
      exception instanceof Error ? exception.stack : String(exception);
    const correlationId = ContextService.getCorrelationId();

    //- ghi log lỗi rpc chuẩn cấu trúc ra stdout qua pino
    this.logger.error(
      {
        type: 'RPC_EXCEPTION',
        statusCode,
        errorMessage: message,
        errorName: error,
        correlationId,
      },
      stack,
      'RpcExceptionFilter',
    );

    //- ném lỗi chuẩn hóa qua rpc để api gateway hoặc service gọi nhận được kèm correlation id
    return throwError(() => ({
      statusCode,
      message,
      error,
      correlationId,
      timestamp: new Date().toISOString(),
    }));
  }
}
