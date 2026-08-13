import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  //- khóa chính tự động tăng trong csdl postgresql
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productName: string;

  @Column('numeric')
  price: number;

  @Column()
  customerEmail: string;

  @Column({ default: 'PENDING' })
  status: string;

  //- thời gian tạo đơn hàng
  @CreateDateColumn()
  createdAt: Date;
}
