import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  //- tạo microservice lắng nghe qua giao thức rabbitmq (amqp)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'], //- url kết nối tới container rabbitmq
        queue: 'notification_queue', //- tên queue mà service này sẽ lắng nghe
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log(
    '🚀 Notification Microservice (RabbitMQ) đang lắng nghe trên queue [notification_queue]...',
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Notification Microservice:', err);
});
