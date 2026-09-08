//- định nghĩa tên chuẩn của các service dùng trong logging và cấu hình hệ thống
export const SERVICE_NAMES = {
  GATEWAY: 'api-gateway',
  AUTH: 'auth-service',
  ORDER: 'order-service',
  INVENTORY: 'inventory-service',
  NOTIFICATION: 'notification-service',
} as const;

export type ServiceName = (typeof SERVICE_NAMES)[keyof typeof SERVICE_NAMES];
