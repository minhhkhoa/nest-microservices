import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  //- bật validation pipe toàn cục để tự động kiểm tra dữ liệu đầu vào theo rule trong dto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //- loại bỏ các field thừa không được định nghĩa trong dto
      forbidNonWhitelisted: true, //- ném lỗi 400 nếu client cố tình truyền lên field lạ
      transform: true, //- tự động chuyển đổi kiểu dữ liệu (payload to dto instance)
    }),
  );

  await app.listen(3000);
  console.log('🚀 API Gateway (HTTP) đang chạy tại: http://localhost:3000');
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy API Gateway:', err);
});
