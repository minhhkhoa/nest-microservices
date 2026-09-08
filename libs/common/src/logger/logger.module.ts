import { Global, Module } from '@nestjs/common';
import { ContextService } from '../context/context.service';
import { AppLoggerService } from './app-logger.service';
import { LogBroadcasterService } from './log-broadcaster.service';

//- module cung cấp logger pino, quản lý context correlation id và phát tán log qua redis
@Global()
@Module({
  providers: [AppLoggerService, ContextService, LogBroadcasterService],
  exports: [AppLoggerService, ContextService, LogBroadcasterService],
})
export class LoggerModule {}
