import { INestMicroservice } from '@nestjs/common';
import { ServiceName } from '../constants/service-name.constant';
import { RpcExceptionFilter } from '../filters/rpc-exception.filter';
import { RpcLoggingInterceptor } from '../interceptors/rpc-logging.interceptor';
import { AppLoggerService } from '../logger/app-logger.service';

//- cấu hình tập trung logger, interceptor và filter cho các microservices
export function setupMicroservice(
  app: INestMicroservice,
  serviceName: ServiceName,
): AppLoggerService {
  const appLogger = app.get(AppLoggerService);
  appLogger.setServiceName(serviceName);

  //- thiết lập appLogger làm logger toàn cục của nestjs để mọi new Logger() đều tự động tích hợp
  app.useLogger(appLogger);

  //- áp dụng interceptor ghi log rpc và đẩy lên redis dashboard
  app.useGlobalInterceptors(new RpcLoggingInterceptor(appLogger, serviceName));

  //- áp dụng exception filter chuẩn hóa cho rpc
  app.useGlobalFilters(new RpcExceptionFilter(appLogger));

  return appLogger;
}
