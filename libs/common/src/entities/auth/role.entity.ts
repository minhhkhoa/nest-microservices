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
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({
    description: 'ID định danh vai trò (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Mã định danh vai trò',
    example: 'admin',
  })
  @Column({ unique: true })
  code: string; //- mã vai trò (vd: super_admin, admin, customer)

  @ApiProperty({
    description: 'Tên hiển thị vai trò',
    example: 'Quản trị viên',
  })
  @Column()
  name: string; //- tên hiển thị (vd: quản trị viên cấp cao, khách hàng)

  @ApiProperty({
    description: 'Mô tả vai trò',
    example: 'Toàn quyền quản trị hệ thống',
  })
  @Column({ default: '' })
  description: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Danh sách các quyền hạn được gán cho vai trò',
    type: () => [Permission],
  })
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ApiHideProperty()
  @OneToMany(() => User, (user) => user.role)
  users: User[];

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
