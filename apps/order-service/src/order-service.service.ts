import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from '@app/common/dtos/order/create-order.dto';
import { Order } from '@app/common/entities/order/order.entity';

@Injectable()
export class OrderServiceService {
  constructor(
    //- inject repository của bảng orders để thực hiện các thao tác database (crud)
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  //- hàm tạo và lưu đơn hàng mới vào csdl postgresql
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
    return await this.orderRepository.save(newOrder);
  }

  //- hàm lấy danh sách tất cả các đơn hàng trong csdl postgresql
  async getOrders(): Promise<Order[]> {
    return await this.orderRepository.find();
  }
}
