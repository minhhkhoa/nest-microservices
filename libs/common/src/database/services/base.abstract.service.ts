import { Logger } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  ConditionQuery,
  FindAllResponse,
} from '../interfaces/pagination.interface';
import { BaseAbstractRepository } from '../repositories/base.abstract.repository';

//- lớp trừu tượng base service bọc qua repository để xử lý nghiệp vụ dùng chung
export abstract class BaseServiceAbstract<T extends ObjectLiteral> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly repository: BaseAbstractRepository<T>) {}

  //- lấy danh sách phân trang kèm bộ lọc
  async findAll(condition?: ConditionQuery<T>): Promise<FindAllResponse<T>> {
    try {
      return await this.repository.findAll(condition);
    } catch (error) {
      this.logger.error(
        `Lỗi khi lấy danh sách ${this.repository.entityName}:`,
        error,
      );
      throw error;
    }
  }

  //- tìm chi tiết bản ghi theo id
  async findById(id: string | number): Promise<T | null> {
    return await this.repository.findById(id);
  }

  //- tìm chi tiết bản ghi theo id hoặc ném lỗi 404
  async findByIdOrFail(id: string | number): Promise<T> {
    return await this.repository.findByIdOrFail(id);
  }

  //- tạo mới bản ghi
  async create(dto: DeepPartial<T>): Promise<T> {
    return await this.repository.create(dto);
  }

  //- cập nhật bản ghi theo id
  async update(
    id: string | number,
    dto: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    return await this.repository.updateByIdOrFail(id, dto);
  }

  //- xóa mềm một hoặc nhiều bản ghi theo id / mảng ids / điều kiện where
  async remove(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean> {
    return await this.repository.softDelete(criteria);
  }

  //- khôi phục một hoặc nhiều bản ghi đã xóa mềm
  async restore(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean> {
    return await this.repository.restore(criteria);
  }

  //- xóa vĩnh viễn một hoặc nhiều bản ghi khỏi database
  async permanentlyDelete(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean> {
    return await this.repository.permanentlyDelete(criteria);
  }
}
