import {
  ConditionQuery,
  CreateOrderDto,
  FindAllResponse,
  Order,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderRepository } from './order.repository';

//- service xử lý nghiệp vụ đơn hàng độc lập, điều phối repository và microservices
@Injectable()
export class OrderServiceService {
  constructor(
    private readonly orderRepository: OrderRepository,

    //- inject rabbitmq client inventory_service đã đăng ký trong module
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryClient: ClientProxy,

    //- inject rabbitmq client notification_service đã đăng ký trong module
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  //- hàm tạo và lưu đơn hàng mới sau khi kiểm tra kho và phát sự kiện thông báo
  async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<{ message: string; order: Order }> {
    //- bước 1: hỏi inventory-service qua rabbitmq xem còn hàng không
    const inventoryCheck = await firstValueFrom(
      this.inventoryClient.send<{
        available: boolean;
        stock: number;
        message: string;
      }>(
        { cmd: 'check_inventory' },
        { productName: createOrderDto.productName, quantity: 1 },
      ),
    );

    //- nếu hết hàng -> ném lỗi rpc để dừng lại ngay, không tạo đơn
    if (!inventoryCheck.available) {
      throw new RpcException(inventoryCheck.message);
    }

    //- bước 2: tạo và lưu đơn hàng mới vào csdl postgresql qua order repository
    const order = await this.orderRepository.create(createOrderDto);

    const result = {
      message: 'Tạo đơn hàng qua RabbitMQ và lưu vào PostgreSQL thành công!',
      order,
    };

    //- bước 3: bắn event order_created sang notification-service theo kiểu fire-and-forget
    this.notificationClient.emit('order_created', result);

    return result;
  }

  //- lấy danh sách đơn hàng có phân trang, bộ lọc và tìm kiếm
  async getOrders(
    condition?: ConditionQuery<Order>,
  ): Promise<FindAllResponse<Order>> {
    return await this.orderRepository.findAll(condition);
  }

  //- lấy chi tiết đơn hàng theo id
  async getOrderById(id: string): Promise<Order> {
    return await this.orderRepository.findByIdOrFail(id);
  }

  //- xóa mềm một hoặc nhiều đơn hàng theo id / mảng ids
  async deleteOrder(ids: string | string[]): Promise<boolean> {
    return await this.orderRepository.softDelete(ids);
  }

  //- khôi phục một hoặc nhiều đơn hàng đã xóa mềm theo id / mảng ids
  async restoreOrder(ids: string | string[]): Promise<boolean> {
    return await this.orderRepository.restore(ids);
  }
}
