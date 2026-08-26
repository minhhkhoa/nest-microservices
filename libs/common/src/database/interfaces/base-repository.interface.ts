import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ConditionQuery, FindAllResponse } from './pagination.interface';

//- interface định nghĩa toàn bộ các phương thức chuẩn của repository
export interface IBaseRepository<T extends ObjectLiteral> {
  //- tạo mới một bản ghi
  create(dto: DeepPartial<T>): Promise<T>;

  //- tạo mới nhiều bản ghi cùng lúc
  createMany(dtos: DeepPartial<T>[]): Promise<T[]>;

  //- lưu bản ghi (insert hoặc update)
  save(entity: T): Promise<T>;

  //- lưu nhiều bản ghi
  saveMany(entities: T[]): Promise<T[]>;

  //- tìm một bản ghi theo điều kiện tùy chọn
  findOne(options?: FindOneOptions<T>): Promise<T | null>;

  //- tìm một bản ghi hoặc ném lỗi 404 nếu không tìm thấy
  findOneOrFail(options?: FindOneOptions<T>): Promise<T>;

  //- tìm một bản ghi theo id
  findById(id: string | number, options?: FindOneOptions<T>): Promise<T | null>;

  //- tìm một bản ghi theo id hoặc ném lỗi 404 nếu không tìm thấy
  findByIdOrFail(id: string | number, options?: FindOneOptions<T>): Promise<T>;

  //- tìm kiếm và phân trang danh sách kèm bộ lọc đa trường
  findAll(condition?: ConditionQuery<T>): Promise<FindAllResponse<T>>;

  //- tìm danh sách bản ghi theo điều kiện thuần typeorm
  findByCondition(options?: FindManyOptions<T>): Promise<T[]>;

  //- cập nhật bản ghi theo id
  update(id: string | number, dto: QueryDeepPartialEntity<T>): Promise<boolean>;

  //- cập nhật bản ghi theo id và trả về dữ liệu mới nhất (hoặc ném lỗi nếu không tồn tại)
  updateByIdOrFail(
    id: string | number,
    dto: QueryDeepPartialEntity<T>,
  ): Promise<T>;

  //- xóa mềm một hoặc nhiều bản ghi theo id / mảng ids / điều kiện where
  softDelete(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean>;

  //- khôi phục một hoặc nhiều bản ghi đã xóa mềm
  restore(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean>;

  //- xóa vĩnh viễn một hoặc nhiều bản ghi khỏi database
  permanentlyDelete(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean>;

  //- đếm số lượng bản ghi thỏa mãn điều kiện
  count(options?: FindManyOptions<T>): Promise<number>;

  //- tạo query builder phục vụ các câu lệnh phức tạp
  createQueryBuilder(alias: string): SelectQueryBuilder<T>;

  //- thực thi khối lệnh trong transaction
  transaction<R>(
    runInTransaction: (entityManager: EntityManager) => Promise<R>,
  ): Promise<R>;
}
