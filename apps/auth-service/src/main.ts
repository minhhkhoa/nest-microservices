import { SERVICE_NAMES, setupMicroservice } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth-service.module';

async function bootstrap() {
  const host = process.env.AUTH_SERVICE_HOST || '127.0.0.1';
  const port = Number(process.env.AUTH_SERVICE_PORT || 3004);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port, //- port tcp của auth-service
      },
    },
  );

  //- cấu hình tập trung logger, interceptor và exception filter qua helper chuẩn hóa
  setupMicroservice(app, SERVICE_NAMES.AUTH);

  await app.listen();
  console.log(`🚀 Auth Microservice (TCP) đang lắng nghe tại ${host}:${port}`);
}
void bootstrap();
