import { Injectable } from '@nestjs/common';
import { RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  //- hàm tạo cấu hình kết nối rabbitmq cho microservice (consumer lắng nghe tin nhắn)
  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'], //- url kết nối rabbitmq server
        queue: queue, //- tên hàng chờ (queue) cần lắng nghe
        noAck: noAck, //- false để kích hoạt cơ chế xác nhận đã nhận tin nhắn (ack/nack)
        persistent: true, //- lưu tin nhắn xuống đĩa cứng để tránh mất dữ liệu khi rabbitmq restart
      },
    };
  }
}
