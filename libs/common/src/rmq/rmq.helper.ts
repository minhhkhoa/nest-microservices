import { RmqRecordBuilder } from '@nestjs/microservices';
import { ContextService } from '../context/context.service';

//- hàm tiện ích đóng gói message rabbitmq tự động đính kèm correlation id vào headers
export const createRmqRecord = <T>(
  data: T,
  customHeaders?: Record<string, any>,
) => {
  const correlationId = ContextService.getCorrelationId();
  return new RmqRecordBuilder(data)
    .setOptions({
      headers: {
        ...(correlationId ? { ['x-correlation-id']: correlationId } : {}),
        ...customHeaders,
      },
    })
    .build();
};
