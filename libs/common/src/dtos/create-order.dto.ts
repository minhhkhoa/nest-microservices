import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  productName: string;

  @IsNumber()
  @Min(1, { message: 'Giá sản phẩm phải lớn hơn 0' })
  price: number;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email khách hàng không được để trống' })
  customerEmail: string;
}
