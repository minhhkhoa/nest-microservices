import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export interface ApiCustomResponseOptions<T = unknown> {
  type?: Type<T> | string | [Type<T>];
  description?: string;
  status?: HttpStatus | number;
  isArray?: boolean;
}

//- decorator chuẩn hóa hiển thị schema response của nestjs khớp với transforminterceptor
export function ApiCustomResponse<T>(
  options: ApiCustomResponseOptions<T> = {},
) {
  const {
    type,
    description = 'Phản hồi thành công',
    status = HttpStatus.OK,
    isArray = false,
  } = options;

  const decorators: (MethodDecorator | ClassDecorator)[] = [];
  let dataSchema: Record<string, unknown> = { type: 'object' };

  //- nếu type truyền vào là 1 class entity hoặc dto
  if (typeof type === 'function') {
    decorators.push(ApiExtraModels(type));
    if (isArray) {
      dataSchema = {
        type: 'array',
        items: { $ref: getSchemaPath(type) },
      };
    } else {
      dataSchema = { $ref: getSchemaPath(type) };
    }
  } else if (
    Array.isArray(type) &&
    type.length > 0 &&
    typeof type[0] === 'function'
  ) {
    decorators.push(ApiExtraModels(type[0]));
    dataSchema = {
      type: 'array',
      items: { $ref: getSchemaPath(type[0]) },
    };
  } else if (typeof type === 'string') {
    dataSchema = isArray ? { type: 'array', items: { type } } : { type };
  }

  decorators.push(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: status },
          message: { type: 'string', example: 'Thao tác thành công' },
          data: dataSchema,
        },
      },
    }),
  );

  return applyDecorators(...decorators);
}

export interface ApiPaginationResponseOptions<T> {
  type: Type<T>;
  description?: string;
  status?: HttpStatus | number;
}

//- decorator chuẩn hóa hiển thị schema response phân trang (kèm metadata pagination)
export function ApiPaginationResponse<T>(
  options: ApiPaginationResponseOptions<T>,
) {
  const {
    type,
    description = 'Lấy danh sách phân trang thành công',
    status = HttpStatus.OK,
  } = options;

  return applyDecorators(
    ApiExtraModels(type),
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: status },
          message: { type: 'string', example: 'Lấy danh sách thành công' },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total_items: { type: 'number', example: 100 },
              total_page: { type: 'number', example: 10 },
            },
          },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(type) },
          },
        },
      },
    }),
  );
}

//- decorator định nghĩa các query parameters cho api phân trang
export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Số thứ tự trang (mặc định 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Số lượng phần tử mỗi trang (mặc định 10)',
      example: 10,
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      description: 'Sắp xếp theo trường (vd: createdAt:DESC)',
    }),
    ApiQuery({
      name: 'keywords',
      required: false,
      type: String,
      description: 'Từ khóa tìm kiếm (chuỗi hoặc mảng JSON)',
    }),
    ApiQuery({
      name: 'fields',
      required: false,
      type: String,
      description: 'Danh sách trường tìm kiếm (dạng mảng JSON)',
    }),
  );
}

export interface ApiFileOptions {
  field?: string;
  isArray?: boolean;
  description?: string;
  required?: boolean;
}

//- decorator hỗ trợ xem form upload 1 file hoặc nhiều file trực tiếp trên giao diện swagger ui
export function ApiCustomFile(options: ApiFileOptions = {}) {
  const {
    field = 'file',
    isArray = false,
    description = 'Tập tin tải lên',
    required = true,
  } = options;

  let propertySchema: Record<string, unknown> = {
    type: 'string',
    format: 'binary',
    description,
  };

  if (isArray) {
    propertySchema = {
      type: 'array',
      items: {
        type: 'string',
        format: 'binary',
      },
      description,
    };
  }

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [field] : [],
        properties: {
          [field]: propertySchema,
        },
      },
    }),
  );
}
