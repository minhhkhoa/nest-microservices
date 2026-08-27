import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID định danh người dùng (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Họ và tên người dùng',
    example: 'Nguyễn Văn A',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Địa chỉ email người dùng',
    example: 'nguyenvana@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  password: string;

  @ApiPropertyOptional({
    description: 'Tên file hoặc đường dẫn ảnh đại diện',
    example: 'avatar-user-123.jpg',
  })
  @Column({ nullable: true })
  avatar: string;

  @ApiPropertyOptional({
    description: 'Thông tin vai trò của người dùng',
    type: () => Role,
  })
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @ApiHideProperty()
  @Column({ nullable: true })
  refreshToken: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của tài khoản',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Thời gian tạo tài khoản',
    example: '2026-08-27T12:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật tài khoản',
    example: '2026-08-27T12:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
