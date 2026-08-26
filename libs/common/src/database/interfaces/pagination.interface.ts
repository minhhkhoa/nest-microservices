import { FindOptionsOrder, FindOptionsSelect, FindOptionsWhere } from 'typeorm';

//- thông tin phân trang trả về cho client
export interface PaginationMetadata {
  page: number;
  limit: number;
  total_items: number;
  total_page: number;
}

//- định dạng phản hồi chuẩn cho các api phân trang danh sách
export interface FindAllResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

//- tùy chọn phân trang và sắp xếp
export interface PaginationOptions<T> {
  page?: number;
  limit?: number;
  skip?: number;
  sort?: FindOptionsOrder<T>;
  select?: FindOptionsSelect<T>; //- Chỉ chọn lấy một số cột cụ thể
  relations?: string[]; //- Quan hệ với các bảng khác cần join
}

//- thông tin tìm kiếm đa trường
export interface SearchQuery<T> {
  fields?: (keyof T | string)[];
  keywords?: string | string[];
}

//- cấu trúc điều kiện truy vấn tổng quát kết hợp filter, options và search
export interface ConditionQuery<T> {
  filter?: FindOptionsWhere<T> | FindOptionsWhere<T>[]; //- bộ lọc chính xác (Equal, In, Between), vd: filter: { status: Status.ACTIVE, categoryId: 'cat-123' }
  options?: PaginationOptions<T>; //- tuỳ chọn phân trang, sắp xếp, select, relations, vd: options: { page: 1, limit: 10, sort: { createdAt: 'DESC' } }
  search?: SearchQuery<T>; //- tìm kiếm gần đúng (Like, Ilike), vd: search: { fields: ['name', 'description'], keywords: 'keyword' }
}
