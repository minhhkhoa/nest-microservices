import {
  AppLoggerService,
  RpcExceptionFilter,
  RpcLoggingInterceptor,
} from '@app/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { InventoryServiceModule } from './inventory-service.module';

async function bootstrap() {
  const rmqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const queue = process.env.INVENTORY_QUEUE || 'inventory_queue';

  //- tạo microservice lắng nghe qua rabbitmq với queue cấu hình từ biến môi trường
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue, //- queue nhận các yêu cầu kiểm tra tồn kho
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  const appLogger = app.get(AppLoggerService);
  appLogger.setServiceName('inventory-service');

  //- áp dụng interceptor ghi log rpc 1 dòng và đẩy lên web dashboard
  app.useGlobalInterceptors(
    new RpcLoggingInterceptor(appLogger, 'inventory-service'),
  );
  app.useGlobalFilters(new RpcExceptionFilter(appLogger));

  await app.listen();
  console.log(
    `🚀 Inventory Microservice (RabbitMQ) đang lắng nghe trên queue [${queue}]...`,
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Inventory Microservice:', err);
});
