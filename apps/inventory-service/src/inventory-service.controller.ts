import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class InventoryServiceController {
  //- giả lập kho hàng trong bộ nhớ
  private readonly inventoryDatabase = [
    { productName: 'prod 5', stock: 5 },
    { productName: 'prod 6', stock: 52 },
    { productName: 'prod 7', stock: 0 },
  ];

  //- lắng nghe yêu cầu kiểm tra tồn kho qua rabbitmq và trả về kết quả cho bên hỏi
  @MessagePattern({ cmd: 'check_inventory' })
  checkInventory(@Payload() data: { productName: string; quantity?: number }): {
    available: boolean;
    stock: number;
    message: string;
  } {
    const quantity = data.quantity || 1;
    console.log('--------------------------------------------------');
    console.log(
      `🔍 [Inventory-Service] Đang kiểm tra tồn kho cho: ${data.productName}`,
    );

    const item = this.inventoryDatabase.find(
      (p) => p.productName.toLowerCase() === data.productName.toLowerCase(),
    );

    //- nếu không tìm thấy hoặc số lượng tồn kho không đủ
    if (!item || item.stock < quantity) {
      console.log(`❌ [Inventory-Service] ${data.productName} -> HẾT HÀNG!`);
      return {
        available: false,
        stock: item ? item.stock : 0,
        message: `Sản phẩm [${data.productName}] hiện đã hết hàng hoặc không đủ số lượng!`,
      };
    }

    console.log(
      `✅ [Inventory-Service] ${data.productName} -> CÒN HÀNG (Tồn: ${item.stock})`,
    );
    return {
      available: true,
      stock: item.stock,
      message: `Sản phẩm [${data.productName}] còn hàng hợp lệ.`,
    };
  }
}
