import { NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IBaseRepository } from '../interfaces/base-repository.interface';
import {
  ConditionQuery,
  FindAllResponse,
} from '../interfaces/pagination.interface';

//- lớp trừu tượng base abstract repository bọc quanh typeorm repository
export abstract class BaseAbstractRepository<
  T extends ObjectLiteral,
> implements IBaseRepository<T> {
  public readonly entityName: string;

  constructor(protected readonly repository: Repository<T>) {
    this.entityName = repository.metadata.name;
  }

  //- tạo mới một entity instance (chưa lưu vào db)
  async create(dto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(dto);
    return await this.repository.save(entity);
  }

  //- tạo mới danh sách entity instances và lưu vào db
  async createMany(dtos: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(dtos);
    return await this.repository.save(entities);
  }

  //- lưu entity vào db
  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  //- lưu danh sách entities vào db
  async saveMany(entities: T[]): Promise<T[]> {
    return await this.repository.save(entities);
  }

  //- tìm một bản ghi theo điều kiện
  async findOne(options?: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options || {});
  }

  //- tìm một bản ghi hoặc ném lỗi nếu không tồn tại
  async findOneOrFail(options?: FindOneOptions<T>): Promise<T> {
    const item = await this.findOne(options);
    if (!item) {
      throw new NotFoundException(
        `Không tìm thấy dữ liệu ${this.entityName} phù hợp`,
      );
    }
    return item;
  }

  //- tìm một bản ghi theo id
  async findById(
    id: string | number,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    const where = { id } as unknown as FindOptionsWhere<T>;
    return await this.repository.findOne({
      ...options,
      where: options?.where
        ? { ...(options.where as object), ...where }
        : where,
    });
  }

  //- tìm một bản ghi theo id hoặc ném lỗi nếu không tồn tại
  async findByIdOrFail(
    id: string | number,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const item = await this.findById(id, options);
    if (!item) {
      throw new NotFoundException(
        `Không tìm thấy ${this.entityName} với id: ${id}`,
      );
    }
    return item;
  }

  //- tìm kiếm, lọc và phân trang danh sách chuẩn hóa
  async findAll(condition?: ConditionQuery<T>): Promise<FindAllResponse<T>> {
    const page =
      condition?.options?.page && condition.options.page > 0
        ? Number(condition.options.page)
        : 1;
    const limit =
      condition?.options?.limit && condition.options.limit > 0
        ? Number(condition.options.limit)
        : 10;
    const skip = condition?.options?.skip ?? (page - 1) * limit;

    let whereConditions: FindOptionsWhere<T> | FindOptionsWhere<T>[] =
      condition?.filter || {};

    //- xử lý tìm kiếm đa trường search (keywords và fields)
    if (condition?.search && condition.search.fields?.length) {
      const { fields, keywords } = condition.search;
      const keywordList = Array.isArray(keywords)
        ? keywords
        : keywords
          ? [keywords]
          : [];

      if (keywordList.length > 0) {
        const searchWhereClauses: FindOptionsWhere<T>[] = [];

        for (const kw of keywordList) {
          if (!kw || typeof kw !== 'string') continue;
          for (const field of fields) {
            const searchClause: Record<string, unknown> = {
              [field as string]: ILike(`%${kw.trim()}%`),
            };

            //- kết hợp điều kiện filter gốc nếu có
            if (Array.isArray(whereConditions)) {
              for (const w of whereConditions) {
                searchWhereClauses.push({
                  ...w,
                  ...searchClause,
                });
              }
            } else {
              searchWhereClauses.push({
                ...whereConditions,
                ...searchClause,
              });
            }
          }
        }

        if (searchWhereClauses.length > 0) {
          whereConditions = searchWhereClauses;
        }
      }
    }

    const findOptions: FindManyOptions<T> = {
      where: whereConditions,
      skip,
      take: limit, //- typeorm quy định bắt buộc dùng từ khóa 'take' thay cho 'limit' trong sql
      order: condition?.options?.sort,
      select: condition?.options?.select,
      relations: condition?.options?.relations,
    };

    const [data, totalItems] = await this.repository.findAndCount(findOptions);
    const totalPage = Math.ceil(totalItems / limit);

    return {
      pagination: {
        page,
        limit,
        total_items: totalItems,
        total_page: totalPage,
      },
      data,
    };
  }

  //- tìm danh sách bản ghi theo find options
  async findByCondition(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  //- cập nhật bản ghi theo id
  async update(
    id: string | number,
    dto: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    const result = await this.repository.update(id, dto);
    return (result.affected ?? 0) > 0;
  }

  //- cập nhật bản ghi theo id và trả về bản ghi sau cập nhật
  async updateByIdOrFail(
    id: string | number,
    dto: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    await this.findByIdOrFail(id);
    await this.repository.update(id, dto);
    return await this.findByIdOrFail(id);
  }

  //- xóa mềm một hoặc nhiều bản ghi (theo id, mảng id hoặc điều kiện where)
  async softDelete(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean> {
    const result = await this.repository.softDelete(
      criteria as string | string[] | number | number[] | FindOptionsWhere<T>,
    );
    return (result.affected ?? 0) > 0;
  }

  //- khôi phục một hoặc nhiều bản ghi đã xóa mềm (theo id, mảng id hoặc điều kiện where)
  async restore(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean> {
    const result = await this.repository.restore(
      criteria as string | string[] | number | number[] | FindOptionsWhere<T>,
    );
    return (result.affected ?? 0) > 0;
  }

  //- xóa vĩnh viễn một hoặc nhiều bản ghi khỏi database (theo id, mảng id hoặc điều kiện where)
  async permanentlyDelete(
    criteria: string | number | (string | number)[] | FindOptionsWhere<T>,
  ): Promise<boolean> {
    const result = await this.repository.delete(
      criteria as string | string[] | number | number[] | FindOptionsWhere<T>,
    );
    return (result.affected ?? 0) > 0;
  }

  //- đếm số lượng bản ghi
  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.repository.count(options);
  }

  //- khởi tạo select query builder
  createQueryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  //- thực thi khối lệnh an toàn trong transaction của typeorm
  async transaction<R>(
    runInTransaction: (entityManager: EntityManager) => Promise<R>,
  ): Promise<R> {
    return await this.repository.manager.transaction(runInTransaction);
  }
}
