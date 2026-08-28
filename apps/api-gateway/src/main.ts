import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  //- cấu hình swagger api documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Microservices - API Gateway')
    .setDescription(
      'Hệ thống tài liệu OpenAPI cho toàn bộ các dịch vụ qua API Gateway, hỗ trợ xem schema request body, response chuẩn hóa và test upload file trực tiếp.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập access token jwt vào đây (không cần chữ Bearer)',
        in: 'header',
      },
      'JWT-auth', //- tên security scheme để gán @ApiBearerAuth('JWT-auth')
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true, //- lưu token khi f5 lại trình duyệt
      filter: true, //- thanh tìm kiếm endpoint
      docExpansion: 'list', //- mặc định mở danh sách endpoint
    },
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`🚀 API Gateway (HTTP) đang chạy tại: http://localhost:${port}`);
  console.log(`📚 Swagger UI tài liệu API: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Lỗi khi khởi chạy API Gateway:', err);
});
