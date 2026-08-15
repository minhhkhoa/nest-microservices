import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CheckInventoryDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm kiểm tra không được để trống' })
  productName: string;

  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng kiểm tra tối thiểu là 1' })
  quantity?: number;
}
