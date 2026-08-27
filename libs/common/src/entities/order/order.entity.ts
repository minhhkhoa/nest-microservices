import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'ID định danh đơn hàng', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  //- tên sản phẩm
  @ApiProperty({ description: 'Tên sản phẩm', example: 'Laptop Dell XPS 15' })
  @Column()
  productName: string;

  //- giá sản phẩm (kiểu số)
  @ApiProperty({ description: 'Giá sản phẩm (VNĐ)', example: 35000000 })
  @Column('numeric')
  price: number;

  //- email của khách hàng
  @ApiProperty({
    description: 'Email khách hàng đặt hàng',
    example: 'customer@gmail.com',
  })
  @Column()
  customerEmail: string;

  //- trạng thái đơn hàng (mặc định là PENDING)
  @ApiProperty({
    description: 'Trạng thái đơn hàng (PENDING, COMPLETED, CANCELLED)',
    example: 'PENDING',
  })
  @Column({ default: 'PENDING' })
  status: string;

  //- thời gian tạo đơn hàng
  @ApiProperty({
    description: 'Thời gian tạo đơn hàng',
    example: '2026-08-27T12:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
