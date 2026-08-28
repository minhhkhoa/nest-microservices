import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  const rmqUrl =
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const queue = process.env.ORDER_QUEUE || 'order_queue';

  //- tạo microservice lắng nghe qua rabbitmq với queue cấu hình từ biến môi trường
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue, //- queue nhận các yêu cầu xử lý đơn hàng
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log(
    `🚀 Order Microservice (RabbitMQ) đang lắng nghe trên queue [${queue}]...`,
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Order Microservice:', err);
});
