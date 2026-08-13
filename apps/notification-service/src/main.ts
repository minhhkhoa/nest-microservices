import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  //- lấy rmqservice từ module chung để lấy cấu hình kết nối rabbitmq
  const rmqService = app.get<RmqService>(RmqService);

  //- kết nối app vào rabbitmq microservice lắng nghe queue NOTIFICATION_SERVICE_QUEUE
  app.connectMicroservice(rmqService.getOptions('NOTIFICATION_SERVICE_QUEUE'));

  //- bắt đầu lắng nghe tin nhắn từ rabbitmq
  await app.startAllMicroservices();
  console.log(
    '🚀 Notification Microservice is running and listening to RabbitMQ!',
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Notification Service:', err);
});
