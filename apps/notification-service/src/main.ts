import { RpcExceptionFilter } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const rmqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const queue = process.env.NOTIFICATION_QUEUE || 'notification_queue';

  //- tạo microservice lắng nghe qua giao thức rabbitmq (amqp) cấu hình qua biến môi trường
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue, //- tên queue mà service này sẽ lắng nghe
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  //- áp dụng filter bắt lỗi và ghi log tập trung cho rpc microservice
  app.useGlobalFilters(new RpcExceptionFilter());

  await app.listen();
  console.log(
    `🚀 Notification Microservice (RabbitMQ) đang lắng nghe trên queue [${queue}]...`,
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Notification Microservice:', err);
});
