//- định nghĩa các kích cỡ ảnh hỗ trợ khi tối ưu hoá
export enum ImageSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ORIGINAL = 'original',
}

//- định nghĩa các định dạng hình ảnh hỗ trợ
export enum ImageFormat {
  WEBP = 'webp',
  AVIF = 'avif',
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  TIFF = 'tiff',
  BMP = 'bmp',
  SVG = 'svg',
  HEIC = 'heic',
}

//- kích thước chiều rộng tương ứng với từng phân loại kích cỡ ảnh
export interface ImageDimensions {
  [ImageSize.SMALL]: number;
  [ImageSize.MEDIUM]: number;
  [ImageSize.LARGE]: number;
  [ImageSize.ORIGINAL]: number;
}
