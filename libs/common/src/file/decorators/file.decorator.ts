import {
  BadRequestException,
  ExecutionContext,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UseInterceptors,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { multerConfig } from '../config/multer.config';

const DEFAULT_FILE_FIELD_NAME = 'file';
const DEFAULT_FILES_FIELD_NAME = 'files';
const DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 20; //- giới hạn dung lượng tối đa 20mb

//- regex kiểm tra định dạng hình ảnh hợp lệ
const ALLOWED_IMAGE_TYPES =
  /^image\/(jpeg|jpg|png|gif|bmp|webp|svg\+xml|tiff|x-icon|vnd\.microsoft\.icon|heic|heif|avif)$/;

//- decorator đánh dấu endpoint upload 1 file
export function UploadSingle({
  field = DEFAULT_FILE_FIELD_NAME,
  options = multerConfig,
}: {
  field?: string;
  options?: MulterOptions;
} = {}): MethodDecorator {
  return applyDecorators(UseInterceptors(FileInterceptor(field, options)));
}

//- decorator đánh dấu endpoint upload danh sách nhiều file cùng trường
export function Upload({
  field = DEFAULT_FILES_FIELD_NAME,
  maxCount = 10,
  options = multerConfig,
}: {
  field?: string;
  maxCount?: number;
  options?: MulterOptions;
} = {}): MethodDecorator {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(field, maxCount, options)),
  );
}

//- decorator đánh dấu endpoint upload nhiều trường file khác nhau
export function Uploads({
  fields,
  options = multerConfig,
  maxCount = 10,
}: {
  fields: string[];
  options?: MulterOptions;
  maxCount?: number;
}): MethodDecorator {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        fields.map((v) => ({ name: v, maxCount })),
        options,
      ),
    ),
  );
}

export interface FileValidationOptions {
  field?: string;
  allowedTypes?: string | RegExp;
  maxSize?: number;
  required?: boolean;
}

//- param decorator lấy và validate 1 file đơn lẻ
export const UploadedSingleFileWithValidation = createParamDecorator(
  async (
    options: FileValidationOptions = {},
    ctx: ExecutionContext,
  ): Promise<Express.Multer.File | undefined> => {
    const {
      field = DEFAULT_FILE_FIELD_NAME,
      allowedTypes = ALLOWED_IMAGE_TYPES,
      maxSize = DEFAULT_MAX_FILE_SIZE,
      required = true,
    } = options;

    //- ép kiểu request sang express request có chứa thông tin file
    const request = ctx.switchToHttp().getRequest<Request>();
    let targetFile: Express.Multer.File | undefined = request.file;

    //- nếu file được truyền qua mảng hoặc object request.files
    if (!targetFile && request.files) {
      if (Array.isArray(request.files)) {
        targetFile = request.files.find(
          (f: Express.Multer.File) => f.fieldname === field,
        );
      } else if (typeof request.files === 'object' && field in request.files) {
        const files = request.files[field];
        targetFile = Array.isArray(files) ? files[0] : files;
      }
    }

    //- kiểm tra trường bắt buộc
    if (required && !targetFile) {
      throw new BadRequestException(`Trường file [${field}] là bắt buộc!`);
    }

    if (!targetFile) {
      return undefined;
    }

    //- chạy pipe kiểm tra kích thước và định dạng file
    const pipe = new ParseFilePipe({
      fileIsRequired: required,
      validators: [
        new MaxFileSizeValidator({ maxSize }),
        new FileTypeValidator({ fileType: allowedTypes }),
      ],
    });

    //- thực thi validate và ép kiểu kết quả trả về
    return (await pipe.transform(targetFile)) as Express.Multer.File;
  },
);

//- param decorator lấy và validate danh sách nhiều file
export const UploadedFilesWithValidation = createParamDecorator(
  async (
    options: FileValidationOptions = {},
    ctx: ExecutionContext,
  ): Promise<Express.Multer.File[]> => {
    const {
      field = DEFAULT_FILES_FIELD_NAME,
      allowedTypes = ALLOWED_IMAGE_TYPES,
      maxSize = DEFAULT_MAX_FILE_SIZE,
      required = true,
    } = options;

    //- ép kiểu request sang express request
    const request = ctx.switchToHttp().getRequest<Request>();
    let targetFiles: Express.Multer.File[] = [];

    //- lấy danh sách file từ mảng hoặc object theo tên trường
    if (Array.isArray(request.files)) {
      targetFiles = request.files;
    } else if (
      request.files &&
      typeof request.files === 'object' &&
      field in request.files
    ) {
      const files = request.files[field];
      targetFiles = Array.isArray(files) ? files : [files];
    }

    if (required && (!targetFiles || targetFiles.length === 0)) {
      throw new BadRequestException(`Danh sách file [${field}] là bắt buộc!`);
    }

    if (!targetFiles || targetFiles.length === 0) {
      return [];
    }

    const pipe = new ParseFilePipe({
      fileIsRequired: required,
      validators: [
        new MaxFileSizeValidator({ maxSize }),
        new FileTypeValidator({ fileType: allowedTypes }),
      ],
    });

    //- duyệt qua từng file và validate
    const validatedFiles: Express.Multer.File[] = [];
    for (const file of targetFiles) {
      //- thực thi validate từng file
      const validated = (await pipe.transform(file)) as Express.Multer.File;
      validatedFiles.push(validated);
    }

    return validatedFiles;
  },
);
