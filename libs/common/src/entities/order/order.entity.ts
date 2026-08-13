import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

//- khai báo entity order tương ứng với bảng orders trong postgresql
@Entity('orders')
export class Order {
  //- khóa chính tự động tăng
  @PrimaryGeneratedColumn()
  id: number;

  //- tên sản phẩm
  @Column()
  productName: string;

  //- giá sản phẩm (kiểu số)
  @Column('numeric')
  price: number;

  //- email của khách hàng
  @Column()
  customerEmail: string;

  //- trạng thái đơn hàng (mặc định là PENDING)
  @Column({ default: 'PENDING' })
  status: string;

  //- thời gian tạo đơn hàng
  @CreateDateColumn()
  createdAt: Date;
}
