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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; //- mã định danh quyền hạn (vd: user_create, product_view)

  @Column()
  name: string; //- tên hiển thị của quyền hạn

  @Column()
  apiPath: string; //- đường dẫn api (vd: /api/v1/users, /api/v1/orders/:id)

  @Column()
  method: string; //- phương thức http (get, post, put, delete, patch)

  @Column()
  module: string; //- nhóm module (vd: users, products, orders, auth)

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
