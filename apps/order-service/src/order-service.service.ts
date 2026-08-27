import { BaseServiceAbstract, CreateOrderDto, Order } from '@app/common';
import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';

//- service xử lý nghiệp vụ đơn hàng kế thừa base service
@Injectable()
export class OrderServiceService extends BaseServiceAbstract<Order> {
  constructor(private readonly orderRepository: OrderRepository) {
    super(orderRepository);
  }

  //- hàm tạo và lưu đơn hàng mới vào csdl postgresql
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.create(createOrderDto);
  }
}
