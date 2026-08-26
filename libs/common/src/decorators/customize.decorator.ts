import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { User } from '../entities/auth/user.entity';

//- bypass hoàn toàn không cần đăng nhập jwt
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

//- route yêu cầu đăng nhập nhưng không cần kiểm tra quyền method + apiPath (vd: get profile, logout)
export const IS_PUBLIC_PERMISSION_KEY = 'isPublicPermission';
export const PublicPermission = () =>
  SetMetadata(IS_PUBLIC_PERMISSION_KEY, true);

//- decorator lấy thông tin user hiện tại từ req.user
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
