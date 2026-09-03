import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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
    example: 'MANAGER',
  })
  @IsNotEmpty({ message: 'Mã vai trò không được để trống' })
  @IsString({ message: 'Mã vai trò phải là chuỗi' })
  code: string;

  @ApiProperty({
    description: 'Tên hiển thị của vai trò',
    example: 'Quản lý kho',
  })
  @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
  @IsString({ message: 'Tên vai trò phải là chuỗi' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết quyền hạn của vai trò',
    example: 'Quản lý toàn bộ thông tin hàng hóa và phân quyền kho',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ID quyền hạn gán cho vai trò',
    example: ['c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'],
    type: [String],
  })
  @IsOptional()
  permissionIds?: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Mã quyền hạn',
    example: 'PERMISSION_CREATE',
  })
  @IsNotEmpty({ message: 'Mã quyền không được để trống' })
  @IsString({ message: 'Mã quyền phải là chuỗi' })
  code: string;

  @ApiProperty({
    description: 'Tên quyền hạn',
    example: 'Tạo quyền hạn mới',
  })
  @IsNotEmpty({ message: 'Tên quyền không được để trống' })
  @IsString({ message: 'Tên quyền phải là chuỗi' })
  name: string;

  @ApiProperty({
    description: 'Đường dẫn API',
    example: '/permissions',
  })
  @IsNotEmpty({ message: 'Đường dẫn API không được để trống' })
  @IsString({ message: 'Đường dẫn API phải là chuỗi' })
  apiPath: string;

  @ApiProperty({
    description: 'Phương thức HTTP (GET, POST, PUT, DELETE, PATCH)',
    example: 'POST',
  })
  @IsNotEmpty({ message: 'Phương thức HTTP không được để trống' })
  @IsString({ message: 'Phương thức HTTP phải là chuỗi' })
  method: string;

  @ApiProperty({
    description: 'Tên module quản lý',
    example: 'PERMISSIONS',
  })
  @IsNotEmpty({ message: 'Tên module không được để trống' })
  @IsString({ message: 'Tên module phải là chuỗi' })
  module: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

//- dto chứa refresh token khi client gửi qua request body thay vì cookie
export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'Refresh token chuỗi jwt (khi không sử dụng cookie httponly)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString({ message: 'Refresh token phải là chuỗi' })
  refreshToken?: string;
}
