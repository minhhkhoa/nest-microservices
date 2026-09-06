import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { IUserPayload } from '../interfaces/auth-user.interface';

//- bypass hoàn toàn không cần đăng nhập jwt
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

//- route yêu cầu đăng nhập nhưng không cần kiểm tra quyền method + apiPath (vd: get profile, logout)
export const IS_PUBLIC_PERMISSION_KEY = 'isPublicPermission';
export const PublicPermission = () =>
  SetMetadata(IS_PUBLIC_PERMISSION_KEY, true);

//- decorator lấy thông tin user hiện tại từ req.user
export const CurrentUser = createParamDecorator(
  //- Nhờ có keyof IUserPayload, nếu gõ @CurrentUser('field_sai_ten')
  //- TypeScript sẽ báo lỗi đỏ ngay lập tức, buộc phải gõ đúng tên field của user để lấy ra field cần dùng.
  (data: keyof IUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: IUserPayload }>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);

//- decorator gắn thông điệp phản hồi cho api (phục vụ transform interceptor)
export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
