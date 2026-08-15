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
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  productName: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là số hợp lệ' })
  @Min(1000, { message: 'Giá sản phẩm tối thiểu phải từ 1.000 VNĐ' })
  price: number;

  @IsOptional()
  @IsInt({ message: 'Số lượng mua phải là số nguyên' })
  @Min(1, { message: 'Số lượng mua tối thiểu phải là 1' })
  quantity?: number;

  @IsEmail({}, { message: 'Email khách hàng không đúng định dạng' })
  @IsNotEmpty({ message: 'Email khách hàng không được để trống' })
  customerEmail: string;
}
