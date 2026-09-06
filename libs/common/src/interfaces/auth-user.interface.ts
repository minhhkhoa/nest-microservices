//- định nghĩa cấu trúc một permission trong session/cache
export interface IUserPermission {
  id: string;
  code: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

//- định nghĩa cấu trúc vai trò của user
export interface IUserRole {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: IUserPermission[];
}

//- định nghĩa type hoàn chỉnh của req.user (đã loại bỏ password và refreshtoken)
export interface IUserPayload {
  id: string; //- id định danh người dùng (uuid)
  name: string; //- họ và tên người dùng
  email: string;
  avatar?: string | null;
  isActive: boolean;
  role: IUserRole;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
//- mở rộng declaration merging cho express request để req.user tự động nhận type-safe
declare global {
  namespace Express {
    interface User extends IUserPayload {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-object-type */
