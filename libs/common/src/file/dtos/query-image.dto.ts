import { IsEnum, IsOptional } from 'class-validator';
import { ImageSize } from '../interfaces/storage.interface';

//- dto kiểm tra tham số truy vấn kích thước hình ảnh
export class QueryImageDto {
  @IsOptional()
  @IsEnum(ImageSize)
  size?: ImageSize;
}
