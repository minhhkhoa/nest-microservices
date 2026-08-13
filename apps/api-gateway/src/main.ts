import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  await app.listen(3000);
  console.log('🚀 API Gateway (HTTP) đang chạy tại: http://localhost:3000');
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy API Gateway:', err);
});
