//- export tất cả entities dùng chung
export * from './entities/order/order.entity';
export * from './entities/auth/permission.entity';
export * from './entities/auth/role.entity';
export * from './entities/auth/user.entity';

//- export decorators, guards, interceptors & filters
export * from './decorators/customize.decorator';
export * from './decorators/query.decorator';
export * from './decorators/swagger.decorator';
export * from './guards/permission.guard';
export * from './interceptors/transform.interceptor';
export * from './interceptors/logging.interceptor';
export * from './interceptors/rpc-logging.interceptor';
export * from './filters/all-exceptions.filter';
export * from './filters/rpc-exception.filter';

//- export context và logger chuẩn cấu trúc
export * from './context/context.service';
export * from './logger/app-logger.service';
export * from './logger/log-broadcaster.service';
export * from './logger/logger.module';
export * from './middlewares/correlation-id.middleware';

//- export dtos & interfaces
export * from './dtos/order/create-order.dto';
export * from './dtos/inventory/check-inventory.dto';
export * from './dtos/auth/auth.dto';
export * from './interfaces/auth-user.interface';

//- export modules và helpers dùng chung
export * from './rmq/rmq.module';
export * from './rmq/rmq.helper';
export * from './tcp/tcp.module';
export * from './tcp/tcp.helper';
export * from './database/database.module';
export * from './database/interfaces/pagination.interface';
export * from './database/interfaces/base-repository.interface';
export * from './database/repositories/base.abstract.repository';
export * from './redis/redis.interface';
export * from './redis/redis.service';
export * from './redis/redis.module';

//- export utils dùng chung
export * from './utils';

//- export constants dùng chung
export * from './constants/rbac.constant';
export * from './constants/message-pattern.constant';
export * from './constants/redis.constant';
export * from './constants/service-name.constant';


//- export file & storage utilities
export * from './file/interfaces/storage.interface';
export * from './file/config/multer.config';
export * from './file/dtos/query-image.dto';
export * from './file/decorators/file.decorator';
