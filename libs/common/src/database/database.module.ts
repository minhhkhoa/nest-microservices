import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

interface DatabaseOptions {
  database: string; //- tên database riêng của service (ví dụ: order_db, user_db, payment_db)
}

@Module({})
export class DatabaseModule {
  //- hàm động khởi tạo kết nối postgresql dùng chung cho toàn bộ các microservices
  static forRoot({ database }: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgrespassword',
          database,
          autoLoadEntities: true, //- tự động nạp tất cả các entity được khai báo trong forFeature
          synchronize: true, //- tự động đồng bộ bảng (chỉ dùng khi dev)
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
