import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Địa chỉ email đăng ký',
    example: 'nguyenvana@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu bảo mật (tối thiểu 6 ký tự)',
    example: '123456',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @ApiPropertyOptional({
    description: 'Mã vai trò muốn gán (mặc định customer)',
    example: 'customer',
  })
  @IsOptional()
  @IsString()
  roleCode?: string; //- mã vai trò muốn gán (mặc định là customer)
}

export class LoginDto {
  @ApiProperty({
    description: 'Địa chỉ email đăng nhập',
    example: 'admin@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}

export class CreateRoleDto {
  @ApiProperty({
    description: 'Mã vai trò (viết liền không dấu)',
    example: 'manager',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Tên hiển thị của vai trò',
    example: 'Quản lý kho',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết quyền hạn của vai trò',
    example: 'Quản lý toàn bộ thông tin hàng hóa và đơn hàng',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ID quyền hạn gán cho vai trò',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsOptional()
  permissionIds?: string[];
}

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Mã quyền hạn',
    example: 'ORDER_CREATE',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Tên quyền hạn',
    example: 'Tạo đơn hàng',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Đường dẫn API',
    example: '/orders',
  })
  @IsNotEmpty()
  @IsString()
  apiPath: string;

  @ApiProperty({
    description: 'Phương thức HTTP (GET, POST, PUT, DELETE, PATCH)',
    example: 'POST',
  })
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiProperty({
    description: 'Tên module quản lý',
    example: 'ORDERS',
  })
  @IsNotEmpty()
  @IsString()
  module: string;
}
