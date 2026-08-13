export class OrderCreatedEvent {
  //- class định nghĩa cấu trúc dữ liệu của sự kiện order_created truyền qua rabbitmq
  orderId: number;
  productName: string;
  price: number;
  customerEmail: string;

  constructor(
    orderId: number,
    productName: string,
    price: number,
    customerEmail: string,
  ) {
    this.orderId = orderId;
    this.productName = productName;
    this.price = price;
    this.customerEmail = customerEmail;
  }
}
