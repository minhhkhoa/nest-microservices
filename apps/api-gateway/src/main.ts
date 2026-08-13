import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  //- chạy api-gateway làm http REST API server tại port 3000
  await app.listen(3000);
  console.log('🚀 API Gateway đang chạy tại địa chỉ: http://localhost:3000');
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy API Gateway:', err);
});
