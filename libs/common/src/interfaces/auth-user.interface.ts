//- định nghĩa cấu trúc một permission trong session/cache
export interface IUserPermission {
  id: string; //- id quyền (uuid)
  code: string; //- mã định danh quyền (vd: 'orders_create', 'users_delete')
  name: string; //- tên hiển thị quyền (vd: 'tạo mới đơn hàng')
  apiPath: string; //- đường dẫn endpoint (vd: '/orders', '/orders/:id')
  method: string; //- phương thức http ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')
  module: string; //- nhóm module quản lý (vd: 'ORDERS', 'USERS')
}

//- định nghĩa cấu trúc vai trò của user
export interface IUserRole {
  id: string; //- id vai trò (uuid)
  code: string; //- mã vai trò (vd: 'admin', 'customer', 'staff')
  name: string; //- tên vai trò (vd: 'quản trị viên')
  description?: string; //- mô tả vai trò
  isActive: boolean; //- trạng thái hoạt động của vai trò
  permissions: IUserPermission[]; //- danh sách quyền hạn được gán cho vai trò này
}

//- định nghĩa type hoàn chỉnh của req.user (đã loại bỏ password và refreshtoken nhạy cảm)
export interface IUserPayload {
  id: string; //- id định danh người dùng (uuid)
  name: string; //- họ và tên người dùng
  email: string; //- địa chỉ email
  avatar?: string | null; //- link ảnh đại diện
  isActive: boolean; //- trạng thái tài khoản (true: hoạt động, false: bị khóa)
  role: IUserRole; //- thông tin vai trò và danh sách quyền hạn phục vụ kiểm tra permission
  createdAt?: Date | string; //- thời điểm tạo tài khoản
  updatedAt?: Date | string; //- thời điểm cập nhật tài khoản
}

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
//- mở rộng declaration merging cho express request để req.user tự động nhận type-safe
declare global {
  namespace Express {
    interface User extends IUserPayload {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
