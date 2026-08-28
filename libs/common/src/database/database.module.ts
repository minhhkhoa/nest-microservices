import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

interface DatabaseOptions {
  database: string; //- tên database riêng của từng service được truyền trực tiếp qua tham số
}

@Module({})
export class DatabaseModule {
  //- hàm động khởi tạo kết nối postgresql với tên database truyền vào qua tham số, các thông tin bảo mật lấy từ configservice
  static forRoot({ database }: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: Number(configService.get<number>('DB_PORT', 5432)),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>(
              'DB_PASSWORD',
              'postgrespassword',
            ),
            database,
            autoLoadEntities: true, //- tự động nạp tất cả các entity được khai báo trong forFeature
            synchronize: true, //- tự động đồng bộ bảng (chỉ dùng khi dev)
          }),
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
