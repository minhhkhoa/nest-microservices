import { ContextService } from '../context/context.service';

//- hàm tiện ích đóng gói payload tcp đính kèm correlation id vào trường _meta
export const withCorrelationMeta = <T>(data: T): T => {
  const correlationId = ContextService.getCorrelationId();
  if (!correlationId) {
    return data;
  }
  if (typeof data === 'object' && data !== null) {
    return {
      ...data,
      _meta: { correlationId },
    };
  }
  return {
    value: data,
    _meta: { correlationId },
  } as unknown as T;
};
