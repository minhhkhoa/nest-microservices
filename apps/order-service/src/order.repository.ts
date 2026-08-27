import { BaseAbstractRepository, Order } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//- repository quản lý các thao tác database cho entity order kế thừa base repository
@Injectable()
export class OrderRepository extends BaseAbstractRepository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly orderModel: Repository<Order>,
  ) {
    super(orderModel);
  }
}
