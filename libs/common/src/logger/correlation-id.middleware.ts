import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ContextService } from './context.service';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

//- middleware trích xuất hoặc khởi tạo correlation id và thiết lập context cho request
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    //- lấy correlation id từ header client gửi lên hoặc tạo mới bằng uuid v4
    const incomingId =
      (req.headers[CORRELATION_ID_HEADER] as string) ||
      (req.headers['x-request-id'] as string);
    const correlationId = incomingId || uuidv4();

    //- gắn mã correlation id vào response header để trả về cho client đối soát
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    //- bọc toàn bộ chu trình xử lý của request trong asynclocalstorage
    ContextService.run(
      {
        correlationId,
        serviceName: process.env.SERVICE_NAME || 'api-gateway',
      },
      () => {
        next();
      },
    );
  }
}
