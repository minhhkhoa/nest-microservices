//- định nghĩa tên injection của các microservices dùng trong toàn hệ thống
export const SERVICES = {
  AUTH: 'AUTH_SERVICE',
  ORDER: 'ORDER_SERVICE',
  INVENTORY: 'INVENTORY_SERVICE',
  NOTIFICATION: 'NOTIFICATION_SERVICE',
} as const;

//- định nghĩa các command (cmd) message pattern cho microservices
export const CMD_PATTERNS = {
  AUTH: {
    VALIDATE_USER: 'auth_validate_user',
    REGISTER: 'auth_register',
    LOGIN: 'auth_login',
    REFRESH_TOKEN: 'auth_refresh_token',
    LOGOUT: 'auth_logout',
    GET_USER_WITH_PERMISSIONS: 'user_get_with_permissions',
  },
  ROLE: {
    CREATE: 'role_create',
    FIND_ALL: 'role_find_all',
    FIND_BY_ID: 'role_find_by_id',
    UPDATE: 'role_update',
    DELETE: 'role_delete',
    RESTORE: 'role_restore',
  },
  PERMISSION: {
    CREATE: 'permission_create',
    FIND_ALL: 'permission_find_all',
    FIND_BY_ID: 'permission_find_by_id',
    UPDATE: 'permission_update',
    DELETE: 'permission_delete',
    RESTORE: 'permission_restore',
  },
  ORDER: {
    CREATE_ORDER: 'create_order',
    GET_ORDERS: 'get_orders',
    GET_ORDER_BY_ID: 'get_order_by_id',
    DELETE_ORDER: 'delete_order',
    RESTORE_ORDER: 'restore_order',
  },
  INVENTORY: {
    CHECK_INVENTORY: 'check_inventory',
  },
} as const;

//- định nghĩa các sự kiện bất đồng bộ (event pattern) gửi qua message broker (rabbitmq)
export const EVENT_PATTERNS = {
  ORDER: {
    ORDER_CREATED: 'order_created',
  },
} as const;
