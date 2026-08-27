import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Tên sản phẩm cần đặt hàng',
    example: 'Laptop Dell XPS 15',
  })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  productName: string;

  @ApiProperty({
    description: 'Giá sản phẩm (VNĐ)',
    example: 35000000,
    minimum: 1000,
  })
  @IsNumber({}, { message: 'Giá sản phẩm phải là số hợp lệ' })
  @Min(1000, { message: 'Giá sản phẩm tối thiểu phải từ 1.000 VNĐ' })
  price: number;

  @ApiPropertyOptional({
    description: 'Số lượng mua (mặc định 1)',
    example: 2,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Số lượng mua phải là số nguyên' })
  @Min(1, { message: 'Số lượng mua tối thiểu phải là 1' })
  quantity?: number;

  @ApiProperty({
    description: 'Email khách hàng đặt hàng',
    example: 'customer@gmail.com',
  })
  @IsEmail({}, { message: 'Email khách hàng không đúng định dạng' })
  @IsNotEmpty({ message: 'Email khách hàng không được để trống' })
  customerEmail: string;
}
