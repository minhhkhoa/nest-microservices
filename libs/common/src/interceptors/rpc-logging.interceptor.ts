import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { ContextService } from '../context/context.service';
import { AppLoggerService } from '../logger/app-logger.service';

interface RmqMessageProps {
  properties?: {
    headers?: Record<string, unknown>;
    correlationId?: string;
  };
}

interface RpcContextLike {
  getMessage?: () => RmqMessageProps;
  getPattern?: () => unknown;
}

interface RpcPayloadMeta {
  _meta?: { correlationId?: string };
  correlationId?: string;
  cmd?: string;
}

//- interceptor ghi log vết và trích xuất correlation id cho các microservices rpc
@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly serviceName: string = process.env.SERVICE_NAME ||
      'microservice',
  ) {
    this.logger.setContext('RPC');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcCtx = context.switchToRpc();
    const rawContext = rpcCtx.getContext<RpcContextLike>();
    const data = rpcCtx.getData<Record<string, unknown> | null | undefined>();

    //- nhận biết giao thức truyền tải rabbitmq hay tcp
    const isRmq = Boolean(
      rawContext && typeof rawContext.getMessage === 'function',
    );
    const transport: 'RMQ' | 'TCP' = isRmq ? 'RMQ' : 'TCP';

    //- trích xuất correlation id từ message headers của amqp hoặc từ meta payload của tcp
    let correlationId: string | undefined;
    if (isRmq && rawContext?.getMessage) {
      const message = rawContext.getMessage();
      const headerId = message?.properties?.headers?.['x-correlation-id'];
      correlationId =
        (typeof headerId === 'string' ? headerId : undefined) ||
        message?.properties?.correlationId;
    } else if (typeof data === 'object' && data !== null) {
      const payloadMeta = data as RpcPayloadMeta;
      correlationId =
        payloadMeta._meta?.correlationId || payloadMeta.correlationId;
    }

    //- nếu chưa có thì tự sinh mới để đảm bảo luồng log không bị khuyết mã vết
    if (!correlationId) {
      correlationId = uuidv4();
    }

    //- lấy thông tin pattern đang thực thi (cmd hoặc event)
    let patternStr = 'RPC_UNKNOWN';
    if (rawContext && typeof rawContext.getPattern === 'function') {
      const p = rawContext.getPattern();
      if (typeof p === 'string' || typeof p === 'number') {
        patternStr = String(p);
      } else if (typeof p === 'object' && p !== null) {
        patternStr = JSON.stringify(p);
      }
    } else if (
      typeof data === 'object' &&
      data !== null &&
      'cmd' in data &&
      typeof (data as RpcPayloadMeta).cmd === 'string'
    ) {
      patternStr = (data as RpcPayloadMeta).cmd as string;
    }

    const now = Date.now();

    //- bọc chuỗi thực thi trong ngữ cảnh asynclocalstorage của service này
    return new Observable((subscriber) => {
      ContextService.run(
        {
          correlationId,
          serviceName: this.serviceName,
        },
        () => {
          const subscription = next
            .handle()
            .pipe(
              tap({
                next: (result: unknown) => {
                  const durationMs = Date.now() - now;
                  this.logger.logRpcRequest({
                    pattern: patternStr,
                    transport,
                    durationMs,
                    success: true,
                    payload: data || undefined,
                    result: result || undefined,
                  });
                },
                error: (err: unknown) => {
                  const durationMs = Date.now() - now;
                  const errorMsg =
                    err instanceof Error ? err.message : String(err);
                  this.logger.logRpcRequest({
                    pattern: patternStr,
                    transport,
                    durationMs,
                    success: false,
                    error: errorMsg,
                    payload: data || undefined,
                  });
                },
              }),
            )
            .subscribe(subscriber);

          return () => subscription.unsubscribe();
        },
      );
    });
  }
}
