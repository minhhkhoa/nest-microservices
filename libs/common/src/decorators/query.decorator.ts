import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Query,
  UsePipes,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindOptionsOrder } from 'typeorm';
import { ConditionQuery } from '../database/interfaces/pagination.interface';

//- pipe tự động bóc tách và phân loại query parameters (phân trang, tìm kiếm, bộ lọc)
@Injectable()
export class QueryFilterPipe<T extends object> implements PipeTransform {
  constructor(private readonly dto?: new () => T) {}

  async transform(
    value: unknown,
    _metadata: ArgumentMetadata,
  ): Promise<ConditionQuery<any>> {
    if (Array.isArray(value) || typeof value !== 'object' || value === null) {
      if (value === undefined || value === null) {
        return {
          filter: {},
          options: { page: 1, limit: 10, skip: 0 },
          search: { keywords: [], fields: [] },
        };
      }
      throw new BadRequestException('Tham số truy vấn không hợp lệ');
    }

    const rawQuery = value as Record<string, unknown>;

    //- validate bộ lọc theo dto nếu có truyền vào
    let filterDto: Record<string, unknown> = {};
    if (this.dto) {
      filterDto = plainToInstance(this.dto, rawQuery, {
        enableImplicitConversion: true,
      }) as Record<string, unknown>;

      const filterErrors = await validate(filterDto as object);
      if (filterErrors.length > 0) {
        throw new BadRequestException(
          filterErrors.flatMap((err) => Object.values(err.constraints || {})),
        );
      }
    }

    //- xử lý phân trang
    const rawPage =
      typeof rawQuery.page === 'string'
        ? rawQuery.page
        : typeof rawQuery.page === 'number'
          ? String(rawQuery.page)
          : '1';
    const rawLimit =
      typeof rawQuery.limit === 'string'
        ? rawQuery.limit
        : typeof rawQuery.limit === 'number'
          ? String(rawQuery.limit)
          : '10';

    const page = Math.max(1, parseInt(rawPage, 10) || 1);
    const limit = Math.max(1, parseInt(rawLimit, 10) || 10);
    const skip = (page - 1) * limit;

    //- xử lý sắp xếp (hỗ trợ dạng sort={"createdAt":"DESC"} hoặc sort=createdAt:DESC)
    let sort: FindOptionsOrder<any> | undefined = undefined;
    if (rawQuery.sort) {
      if (typeof rawQuery.sort === 'object' && rawQuery.sort !== null) {
        sort = rawQuery.sort as FindOptionsOrder<any>;
      } else if (typeof rawQuery.sort === 'string') {
        try {
          sort = JSON.parse(rawQuery.sort) as FindOptionsOrder<any>;
        } catch {
          //- dạng createdAt:DESC
          const parts = rawQuery.sort.split(':');
          if (parts.length === 2) {
            sort = {
              [parts[0]]: parts[1].toUpperCase(),
            } as FindOptionsOrder<any>;
          } else {
            sort = { [rawQuery.sort]: 'ASC' } as FindOptionsOrder<any>;
          }
        }
      }
    }

    //- helper phân tách mảng từ query string
    const parseQueryArray = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        return val.flatMap((v: unknown) => {
          if (typeof v === 'string' && v.startsWith('[') && v.endsWith(']')) {
            try {
              const parsed: unknown = JSON.parse(v);
              return Array.isArray(parsed)
                ? (parsed as unknown[]).map((item) => String(item))
                : [v];
            } catch {
              return [v];
            }
          }
          return [String(v)];
        });
      }
      if (typeof val === 'string') {
        if (val.startsWith('[') && val.endsWith(']')) {
          try {
            const parsed: unknown = JSON.parse(val);
            return Array.isArray(parsed)
              ? (parsed as unknown[]).map((item) => String(item))
              : [val];
          } catch {
            return [val];
          }
        }
        return [val];
      }
      return [];
    };

    //- bóc tách thông tin tìm kiếm
    const search = {
      keywords: parseQueryArray(rawQuery.keywords),
      fields: parseQueryArray(rawQuery.fields),
    };

    //- lọc bỏ các key mặc định để lấy filter nghiệp vụ
    const reservedKeys = ['limit', 'page', 'keywords', 'fields', 'sort'];
    const filter: Record<string, unknown> = {};

    for (const key of Object.keys(rawQuery)) {
      const rawVal = rawQuery[key];
      if (
        rawVal !== undefined &&
        rawVal !== null &&
        rawVal !== '' &&
        !reservedKeys.includes(key)
      ) {
        filter[key] = this.dto && key in filterDto ? filterDto[key] : rawVal;
      }
    }

    return {
      filter,
      options: {
        page,
        limit,
        skip,
        sort,
      },
      search,
    };
  }
}

//- decorator @QueryFiltered(Dto) dùng tại controller để tự động format query
export function QueryFiltered<T extends object>(
  model?: new () => T,
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    Query()(target, propertyKey, parameterIndex);

    if (propertyKey) {
      const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
      if (descriptor) {
        const methodDecorator = UsePipes(new QueryFilterPipe(model));
        methodDecorator(target, propertyKey, descriptor);
      }
    }
  };
}
