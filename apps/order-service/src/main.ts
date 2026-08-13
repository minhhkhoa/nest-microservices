import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  //- tạo microservice lắng nghe qua giao thức tcp thay vì http server
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001, //- order-service sẽ lắng nghe cổng tcp 3001 thay vì cổng http 3000 như cũ
      },
    },
  );

  await app.listen();
  console.log('🚀 Order Microservice (TCP) đang lắng nghe tại cổng 3001...');
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Order Microservice:', err);
});
