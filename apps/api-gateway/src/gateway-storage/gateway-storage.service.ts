import { ImageDimensions, ImageFormat, ImageSize } from '@app/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, promises as fsPromises } from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GatewayStorageService {
  //- đường dẫn thư mục uploads ngay trong thư mục gốc của dự án
  private readonly uploadsPath = path.resolve(process.cwd(), 'uploads');

  //- bảng kích thước chiều rộng tương ứng cho các kích cỡ ảnh
  private readonly dimensions: ImageDimensions = {
    [ImageSize.SMALL]: 100,
    [ImageSize.MEDIUM]: 300,
    [ImageSize.LARGE]: 900,
    [ImageSize.ORIGINAL]: 0,
  };

  //- thứ tự ưu tiên kích cỡ ảnh khi tìm kiếm
  private readonly priority: ImageSize[] = [
    ImageSize.ORIGINAL,
    ImageSize.LARGE,
    ImageSize.MEDIUM,
    ImageSize.SMALL,
  ];

  //- khởi tạo kiểm tra và tạo thư mục uploads nếu chưa tồn tại
  constructor() {
    if (!existsSync(this.uploadsPath)) {
      fsPromises.mkdir(this.uploadsPath, { recursive: true }).catch((err) => {
        console.error('Lỗi khi tạo thư mục uploads:', err);
      });
    }
  }

  //- lưu 1 file và tự động resize nếu là hình ảnh
  async saveOne(
    input: Express.Multer.File | Buffer,
    sizes: ImageSize[] = [
      ImageSize.ORIGINAL,
      ImageSize.LARGE,
      ImageSize.MEDIUM,
      ImageSize.SMALL,
    ],
  ): Promise<{ filename: string; url: string; originalName?: string }> {
    if (!input) {
      throw new BadRequestException('Không tìm thấy dữ liệu file upload!');
    }

    let buffer: Buffer;
    let originalName = 'file';
    let mimeType = '';

    if (Buffer.isBuffer(input)) {
      buffer = input;
    } else {
      buffer = input.buffer;
      originalName = input.originalname;
      mimeType = input.mimetype;
    }

    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Dữ liệu file tải lên bị rỗng!');
    }

    const uniqueId = `${Date.now()}-${uuidv4()}`;

    //- kiểm tra xem file có phải là hình ảnh có thể xử lý qua sharp không
    let isImage = false;
    let format = '';

    try {
      const metadata = await sharp(buffer).metadata();
      if (metadata && metadata.format) {
        isImage = true;
        format = metadata.format;
      }
    } catch {
      isImage = false;
    }

    //- nếu là hình ảnh: tạo thư mục riêng theo uniqueId và lưu các size
    if (isImage) {
      const folderPath = path.join(this.uploadsPath, uniqueId);
      await fsPromises.mkdir(folderPath, { recursive: true });

      for (const size of sizes) {
        const width = this.dimensions[size];
        const filePath = path.join(folderPath, `${size}.${format}`);

        if (size === ImageSize.ORIGINAL) {
          await fsPromises.writeFile(filePath, new Uint8Array(buffer));
          continue;
        }

        const convertedBuffer = await this.convertToFormat(
          buffer,
          format,
          width,
        );
        await fsPromises.writeFile(filePath, new Uint8Array(convertedBuffer));
      }

      const filename = `${uniqueId}.${format}`;
      return {
        filename,
        url: `/storage/${filename}`,
        originalName,
      };
    }

    //- nếu là file thông thường (pdf, docx, zip...): lưu trực tiếp vào thư mục uploads
    const ext =
      path.extname(originalName) ||
      (mimeType ? `.${mimeType.split('/')[1]}` : '');
    const filename = `${uniqueId}${ext}`;
    const filePath = path.join(this.uploadsPath, filename);

    await fsPromises.writeFile(filePath, new Uint8Array(buffer));

    return {
      filename,
      url: `/storage/${filename}`,
      originalName,
    };
  }

  //- lưu danh sách nhiều file
  async saveMultiple(
    files: Express.Multer.File[],
    sizes?: ImageSize[],
  ): Promise<{ filename: string; url: string; originalName?: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Danh sách file rỗng!');
    }

    const results: { filename: string; url: string; originalName?: string }[] =
      [];
    for (const file of files) {
      const saved = await this.saveOne(file, sizes);
      results.push(saved);
    }

    return results;
  }

  //- chuyển đổi định dạng và kích cỡ hình ảnh qua sharp
  private async convertToFormat(
    buffer: Buffer,
    format: string,
    width?: number,
  ): Promise<Buffer> {
    try {
      let transform = sharp(buffer);
      if (width && width > 0) {
        transform = transform.resize(width, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      //- kiểm tra định dạng ảnh theo enum ImageFormat
      switch (format.toLowerCase() as ImageFormat) {
        case ImageFormat.WEBP:
          return await transform.webp({ quality: 80 }).toBuffer();
        case ImageFormat.AVIF:
          return await transform.avif({ quality: 75 }).toBuffer();
        case ImageFormat.JPEG:
        case ImageFormat.JPG:
          return await transform.jpeg({ quality: 85 }).toBuffer();
        case ImageFormat.PNG:
          return await transform.png({ compressionLevel: 9 }).toBuffer();
        case ImageFormat.GIF:
          return await transform.gif().toBuffer();
        default:
          return await transform.toBuffer();
      }
    } catch (err) {
      console.error(`Lỗi khi convert ảnh sang định dạng ${format}:`, err);
      return buffer;
    }
  }

  //- lấy đường dẫn file thực tế trên ổ đĩa dựa trên filename và size yêu cầu
  getImagePath(filename: string, requestedSize?: ImageSize): string {
    const parts = filename.split('.');
    const baseName = parts[0];
    const ext = parts[1];

    //- trường hợp ảnh được lưu trong thư mục đa kích cỡ
    const folderPath = path.join(this.uploadsPath, baseName);
    if (existsSync(folderPath)) {
      const searchSizes = requestedSize ? [requestedSize] : this.priority;
      for (const size of searchSizes) {
        const candidate = path.join(folderPath, `${size}.${ext}`);
        if (existsSync(candidate)) {
          return candidate;
        }
      }
      //- nếu không thấy đúng size, lấy file gốc original
      const fallbackOriginal = path.join(
        folderPath,
        `${ImageSize.ORIGINAL}.${ext}`,
      );
      if (existsSync(fallbackOriginal)) {
        return fallbackOriginal;
      }
    }

    //- trường hợp file đơn lẻ nằm trực tiếp ở uploads/
    const directFilePath = path.join(this.uploadsPath, filename);
    if (existsSync(directFilePath)) {
      return directFilePath;
    }

    throw new NotFoundException(
      `Không tìm thấy file [${filename}] trên hệ thống!`,
    );
  }

  //- xóa file hoặc thư mục ảnh tương ứng
  async deleteFile(filename: string): Promise<boolean> {
    const baseName = filename.split('.')[0];
    const folderPath = path.join(this.uploadsPath, baseName);

    //- xóa thư mục ảnh đa kích cỡ nếu có
    if (existsSync(folderPath)) {
      await fsPromises.rm(folderPath, { recursive: true, force: true });
      return true;
    }

    //- xóa file đơn lẻ nếu có
    const directFilePath = path.join(this.uploadsPath, filename);
    if (existsSync(directFilePath)) {
      await fsPromises.rm(directFilePath, { force: true });
      return true;
    }

    throw new NotFoundException(`File [${filename}] không tồn tại để xóa!`);
  }
}
