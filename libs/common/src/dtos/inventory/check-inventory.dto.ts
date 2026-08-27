import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CheckInventoryDto {
  @ApiProperty({
    description: 'Tên sản phẩm cần kiểm tra tồn kho',
    example: 'Laptop Dell XPS 15',
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm kiểm tra không được để trống' })
  productName: string;

  @ApiPropertyOptional({
    description: 'Số lượng cần kiểm tra (mặc định 1)',
    example: 2,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng kiểm tra tối thiểu là 1' })
  quantity?: number;
}
