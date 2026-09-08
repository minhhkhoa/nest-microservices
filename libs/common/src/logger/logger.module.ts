import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';
import { ContextService } from './context.service';
import { LogBroadcasterService } from './log-broadcaster.service';

//- module cung cấp hệ thống logger, quản lý context correlation id và phát tán log qua redis
@Global()
@Module({
  providers: [AppLoggerService, ContextService, LogBroadcasterService],
  exports: [AppLoggerService, ContextService, LogBroadcasterService],
})
export class LoggerModule {}
