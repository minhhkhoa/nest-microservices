import {
  ApiCustomFile,
  ApiCustomResponse,
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
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GatewayStorageService } from './gateway-storage.service';

@ApiTags('Storage')
@Controller('storage')
export class GatewayStorageController {
  constructor(private readonly storageService: GatewayStorageService) {}

  //- endpoint upload một file đơn lẻ (hỗ trợ tự động resize ảnh đa kích cỡ)
  @Post('upload-single')
  @ApiOperation({
    summary: 'Tải lên 1 file đơn lẻ (tự động resize ảnh đa kích cỡ)',
  })
  @ResponseMessage('Tải lên file thành công')
  @ApiCustomFile({
    field: 'file',
    isArray: false,
    description: 'File hình ảnh cần tải lên',
  })
  @ApiCustomResponse({ description: 'Tải lên file thành công' })
  @UploadSingle({ field: 'file' })
  async uploadSingle(
    @UploadedSingleFileWithValidation({ field: 'file', required: true })
    file: Express.Multer.File,
  ) {
    return await this.storageService.saveOne(file);
  }

  //- endpoint upload nhiều file cùng lúc
  @Post('upload-multiple')
  @ApiOperation({ summary: 'Tải lên danh sách nhiều file cùng lúc' })
  @ResponseMessage('Tải lên danh sách file thành công')
  @ApiCustomFile({
    field: 'files',
    isArray: true,
    description: 'Danh sách các file hình ảnh cần tải lên',
  })
  @ApiCustomResponse({
    isArray: true,
    description: 'Tải lên danh sách file thành công',
  })
  @Upload({ field: 'files', maxCount: 10 })
  async uploadMultiple(
    @UploadedFilesWithValidation({ field: 'files', required: true })
    files: Express.Multer.File[],
  ) {
    return await this.storageService.saveMultiple(files);
  }

  //- endpoint xem hoặc tải file tĩnh (hỗ trợ query ?size=small|medium|large|original đối với hình ảnh)
  @Get(':filename')
  @ApiOperation({
    summary: 'Xem hoặc tải file tĩnh theo tên file và kích thước',
  })
  @ApiParam({
    name: 'filename',
    description: 'Tên file hình ảnh/tài liệu (vd: image-123456.jpg)',
    example: 'avatar.jpg',
  })
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
  @ApiOperation({ summary: 'Xóa file tĩnh hoặc thư mục ảnh khỏi hệ thống' })
  @ApiParam({
    name: 'filename',
    description: 'Tên file cần xóa khỏi hệ thống',
    example: 'avatar.jpg',
  })
  @ResponseMessage('Xóa file thành công')
  @ApiCustomResponse({ description: 'Xóa file thành công' })
  async deleteFile(@Param('filename') filename: string) {
    await this.storageService.deleteFile(filename);
    return {
      deleted: true,
      filename,
    };
  }
}
