import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);

  //- bật validation pipe để tự động kiểm tra dữ liệu dto
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //- khởi chạy http server tại cổng 3000
  await app.listen(3000);
  console.log('🚀 Order Service (Bài 1) đang chạy tại: http://localhost:3000');
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy Order Service:', err);
});
