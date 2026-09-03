import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

//- đường dẫn thư mục lưu trữ file log
const logDir = path.resolve(process.cwd(), 'logs');
const logger = new Logger('FileLogger');

//- tự động tạo thư mục logs nếu chưa tồn tại
const ensureLogDirExists = (): void => {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

//- lấy chuỗi ngày hiện tại định dạng yyyy-mm-dd
export const getCurrentDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

//- lấy chuỗi thời gian hiện tại định dạng yyyy-mm-dd hh:mm:ss
export const getFormattedTimestamp = (): string => {
  const now = new Date();
  const date = getCurrentDateString();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${date} ${hours}:${minutes}:${seconds}`;
};

//- ghi log vào file bất đồng bộ không gây nghẽn tiến trình
export const writeLogToFile = (filename: string, content: string): void => {
  ensureLogDirExists();
  const filePath = path.join(logDir, filename);
  fs.appendFile(filePath, `${content}\n`, (err) => {
    if (err) {
      logger.warn(`Không thể ghi log vào file ${filename}: ${err.message}`);
    }
  });
};
