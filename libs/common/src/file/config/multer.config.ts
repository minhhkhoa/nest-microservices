import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';

//- cấu hình lưu file tạm thời vào thư mục uploads
export const multerDiskConfig: MulterOptions = {
  storage: diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const uploadPath = join(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const fileExtName = extname(file.originalname);
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${randomName}${fileExtName}`);
    },
  }),
};

//- cấu hình lưu file tạm trong ram buffer để xử lý qua sharp
export const multerMemoryConfig: MulterOptions = {
  storage: memoryStorage(),
};

//- cấu hình multer mặc định
export const multerConfig: MulterOptions = multerMemoryConfig;
