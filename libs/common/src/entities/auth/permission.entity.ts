import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty({
    description: 'ID định danh quyền hạn (UUID)',
    example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Mã quyền hạn',
    example: 'PERMISSION_CREATE',
  })
  @Column({ unique: true })
  code: string; //- mã định danh quyền hạn (vd: user_create, product_view)

  @ApiProperty({
    description: 'Tên hiển thị quyền hạn',
    example: 'Tạo quyền hạn mới',
  })
  @Column()
  name: string; //- tên hiển thị của quyền hạn

  @ApiProperty({
    description: 'Đường dẫn API',
    example: '/permissions',
  })
  @Column()
  apiPath: string; //- đường dẫn api (vd: /api/v1/users, /api/v1/orders/:id)

  @ApiProperty({
    description: 'Phương thức HTTP (GET, POST, PUT, DELETE, PATCH)',
    example: 'POST',
  })
  @Column()
  method: string; //- phương thức http (get, post, put, delete, patch)

  @ApiProperty({
    description: 'Nhóm module quản lý',
    example: 'PERMISSIONS',
  })
  @Column()
  module: string; //- nhóm module (vd: users, products, orders, auth)

  @ApiHideProperty()
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2026-08-27T12:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    example: '2026-08-27T12:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
