import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  //- khóa chính tự động tăng trong csdl postgresql
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  customerEmail: string;

  @Column()
  message: string;

  @Column({ default: 'SENT' })
  status: string;

  //- thời gian gửi thông báo
  @CreateDateColumn()
  sentAt: Date;
}
