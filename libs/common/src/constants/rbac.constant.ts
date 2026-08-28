//- định nghĩa các hằng số role mặc định của hệ thống
export const ROLE_ADMIN = process.env.DEFAULT_ADMIN_ROLE;
export const ROLE_CUSTOMER = process.env.DEFAULT_CUSTOMER_ROLE;

//- cấu trúc một permission mẫu
export interface SeedPermissionItem {
  code: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

//- cấu hình module phục vụ sinh tự động danh sách quyền hạn
export interface ResourceModuleConfig {
  module: string; //- tên module viết hoa (vd: ORDERS, ROLES, PERMISSIONS)
  basePath: string; //- đường dẫn gốc (vd: /orders, /roles, /products)
  resourceName: string; //- tên tiếng việt mô tả đối tượng (vd: đơn hàng, vai trò, sản phẩm)
}

//- hàm factory tổng quát giúp sinh ra trọn bộ 6 quyền hạn crud chuẩn cho bất kỳ module nào
export function createResourcePermissions(
  config: ResourceModuleConfig,
): SeedPermissionItem[] {
  const { module, basePath, resourceName } = config;
  const modUpper = module.toUpperCase();

  return [
    {
      code: `${modUpper}_CREATE`,
      name: `Tạo mới ${resourceName}`,
      apiPath: basePath,
      method: 'POST',
      module: modUpper,
    },
    {
      code: `${modUpper}_GET_ALL`,
      name: `Lấy danh sách ${resourceName}`,
      apiPath: basePath,
      method: 'GET',
      module: modUpper,
    },
    {
      code: `${modUpper}_GET_BY_ID`,
      name: `Lấy chi tiết ${resourceName} theo ID`,
      apiPath: `${basePath}/:id`,
      method: 'GET',
      module: modUpper,
    },
    {
      code: `${modUpper}_UPDATE`,
      name: `Cập nhật thông tin ${resourceName}`,
      apiPath: `${basePath}/:id`,
      method: 'PATCH',
      module: modUpper,
    },
    {
      code: `${modUpper}_DELETE`,
      name: `Xóa mềm ${resourceName}`,
      apiPath: `${basePath}/:id`,
      method: 'DELETE',
      module: modUpper,
    },
    {
      code: `${modUpper}_RESTORE`,
      name: `Khôi phục ${resourceName} đã xóa mềm`,
      apiPath: `${basePath}/:id/restore`,
      method: 'POST',
      module: modUpper,
    },
  ];
}

//- danh mục các module crud chuẩn của hệ thống
//- sau này khi có thêm module mới, lập trình viên chỉ cần thêm 1 dòng vào danh sách này
export const DEFAULT_CRUD_MODULES: ResourceModuleConfig[] = [
  { module: 'ORDERS', basePath: '/orders', resourceName: 'đơn hàng' },
  { module: 'ROLES', basePath: '/roles', resourceName: 'vai trò' },
  {
    module: 'PERMISSIONS',
    basePath: '/permissions',
    resourceName: 'quyền hạn',
  },
];

//- các quyền hạn đặc thù không theo chuẩn crud cơ bản (ví dụ module upload storage)
export const SPECIAL_PERMISSIONS: SeedPermissionItem[] = [
  {
    code: 'STORAGE_UPLOAD_SINGLE',
    name: 'Tải lên 1 file hình ảnh/tài liệu đơn lẻ',
    apiPath: '/storage/upload-single',
    method: 'POST',
    module: 'STORAGE',
  },
  {
    code: 'STORAGE_UPLOAD_MULTIPLE',
    name: 'Tải lên danh sách nhiều file cùng lúc',
    apiPath: '/storage/upload-multiple',
    method: 'POST',
    module: 'STORAGE',
  },
  {
    code: 'STORAGE_GET_FILE',
    name: 'Xem hoặc tải file tĩnh từ hệ thống',
    apiPath: '/storage/:filename',
    method: 'GET',
    module: 'STORAGE',
  },
  {
    code: 'STORAGE_DELETE_FILE',
    name: 'Xóa file tĩnh hoặc thư mục ảnh',
    apiPath: '/storage/:filename',
    method: 'DELETE',
    module: 'STORAGE',
  },
];

//- tổng hợp toàn bộ danh sách permissions mặc định cần nạp vào csdl
export const DEFAULT_PERMISSIONS: SeedPermissionItem[] = [
  ...DEFAULT_CRUD_MODULES.flatMap((mod) => createResourcePermissions(mod)),
  ...SPECIAL_PERMISSIONS,
];

//- danh sách các mã quyền hạn cho phép gán cho role customer
export const CUSTOMER_PERMISSION_CODES: string[] = [
  'ORDER_CREATE',
  'ORDER_GET_ALL',
  'ORDER_GET_BY_ID',
  'STORAGE_UPLOAD_SINGLE',
  'STORAGE_GET_FILE',
];
