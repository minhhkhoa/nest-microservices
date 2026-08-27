import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ImageSize } from '../interfaces/storage.interface';

//- dto kiểm tra tham số truy vấn kích thước hình ảnh
export class QueryImageDto {
  @ApiPropertyOptional({
    enum: ImageSize,
    description:
      'Kích thước hình ảnh cần lấy (small: 150px, medium: 500px, large: 1024px, original)',
    example: ImageSize.MEDIUM,
  })
  @IsOptional()
  @IsEnum(ImageSize)
  size?: ImageSize;
}
