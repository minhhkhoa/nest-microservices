import {
  QueryImageDto,
  ResponseMessage,
  Upload,
  UploadSingle,
  UploadedFilesWithValidation,
  UploadedSingleFileWithValidation,
} from '@app/common';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GatewayStorageService } from './gateway-storage.service';

@Controller('storage')
export class GatewayStorageController {
  constructor(private readonly storageService: GatewayStorageService) {}

  //- endpoint upload một file đơn lẻ (hỗ trợ tự động resize ảnh đa kích cỡ)
  @Post('upload-single')
  @ResponseMessage('Tải lên file thành công')
  @UploadSingle({ field: 'file' })
  async uploadSingle(
    @UploadedSingleFileWithValidation({ field: 'file', required: true })
    file: Express.Multer.File,
  ) {
    return await this.storageService.saveOne(file);
  }

  //- endpoint upload nhiều file cùng lúc
  @Post('upload-multiple')
  @ResponseMessage('Tải lên danh sách file thành công')
  @Upload({ field: 'files', maxCount: 10 })
  async uploadMultiple(
    @UploadedFilesWithValidation({ field: 'files', required: true })
    files: Express.Multer.File[],
  ) {
    return await this.storageService.saveMultiple(files);
  }

  //- endpoint xem hoặc tải file tĩnh (hỗ trợ query ?size=small|medium|large|original đối với hình ảnh)
  @Get(':filename')
  getFile(
    @Param('filename') filename: string,
    @Query() query: QueryImageDto,
    @Res() res: Response,
  ) {
    const filePath = this.storageService.getImagePath(filename, query.size);
    return res.sendFile(filePath);
  }

  //- endpoint xóa file hoặc thư mục ảnh
  @Delete(':filename')
  @ResponseMessage('Xóa file thành công')
  async deleteFile(@Param('filename') filename: string) {
    await this.storageService.deleteFile(filename);
    return {
      deleted: true,
      filename,
    };
  }
}
