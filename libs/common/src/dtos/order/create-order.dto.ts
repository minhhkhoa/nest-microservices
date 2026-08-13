import { IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

//- tách ra file dto ở common để dùng chung cho các microservices cần đến, sau chỉ sửa 1 chỗ này thôi

//- dto dùng để kiểm tra dữ liệu client gửi lên khi tạo đơn hàng
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
