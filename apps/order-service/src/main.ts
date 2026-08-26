import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  //- tạo microservice lắng nghe qua rabbitmq với queue riêng là order_queue
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'order_queue', //- queue nhận các yêu cầu xử lý đơn hàng
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log(
    '🚀 Order Microservice (RabbitMQ) đang lắng nghe trên queue [order_queue]...',
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Order Microservice:', err);
});
