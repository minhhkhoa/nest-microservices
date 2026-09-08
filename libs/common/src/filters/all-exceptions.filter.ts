import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ContextService } from '../logger/context.service';
import { AppLoggerService } from '../logger/app-logger.service';

//- bộ lọc ngoại lệ toàn cục cho tầng http gateway bắt tất cả các loại lỗi và log ra stdout
@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('AllExceptionsFilter');
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

      //- xử lý lỗi rpc trả về từ microservice qua rabbitmq hoặc tcp
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

    const url = request?.url || '';
    const method = request?.method || '';
    const ip = request?.ip || request?.socket?.remoteAddress || 'unknown';
    const stack =
      exception instanceof Error ? exception.stack : String(exception);
    const correlationId = ContextService.getCorrelationId();

    //- ghi log lỗi chuẩn cấu trúc lên web dashboard
    this.logger.error(
      {
        type: 'HTTP_EXCEPTION',
        method,
        url,
        statusCode: status,
        ip,
        errorMessage: message,
        errorName,
        correlationId,
      },
      stack,
      'AllExceptionsFilter',
    );

    //- trả về response chuẩn hóa cho client kèm correlation id để đối soát
    response.status(status).json({
      statusCode: status,
      message,
      error: errorName,
      correlationId,
      timestamp: new Date().toISOString(),
      path: url,
    });
  }
}
