import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { InventoryServiceModule } from './inventory-service.module';

async function bootstrap() {
  //- tạo microservice lắng nghe qua rabbitmq với queue riêng là inventory_queue
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'inventory_queue', //- queue nhận các yêu cầu kiểm tra tồn kho
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log(
    '🚀 Inventory Microservice (RabbitMQ) đang lắng nghe trên queue [inventory_queue]...',
  );
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Inventory Microservice:', err);
});
