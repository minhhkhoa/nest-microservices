import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { match } from 'path-to-regexp';
import { ROLE_ADMIN } from '../constants/rbac.constant';
import {
  IS_PUBLIC_KEY,
  IS_PUBLIC_PERMISSION_KEY,
} from '../decorators/customize.decorator';
import { User } from '../entities/auth/user.entity';

interface AuthenticatedRequest {
  user?: User;
  method: string;
  url?: string;
  originalUrl?: string;
  route?: { path: string };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //- bypass nếu route được gắn @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    //- bypass nếu route được gắn @PublicPermission() (chỉ cần đăng nhập)
    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicPermission) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    //- nếu chưa đăng nhập hoặc không có user -> chặn lại
    if (!user) {
      throw new ForbiddenException('Bạn chưa đăng nhập');
    }

    //- bypass cho role admin tối cao
    const adminRole = process.env.DEFAULT_ADMIN_ROLE || ROLE_ADMIN;
    if (
      user.role?.code === adminRole ||
      user.role?.code === 'ADMIN' ||
      user.role?.code === 'SUPER_ADMIN'
    ) {
      return true;
    }

    //- lấy method và đường dẫn pathname thực tế (loại bỏ query params)
    const method = request.method.toUpperCase();
    const actualPath = (
      request.originalUrl ||
      request.url ||
      request.route?.path ||
      ''
    ).split('?')[0];

    //- bypass mặc định cho các route /api/auth hoặc /auth
    if (actualPath.startsWith('/api/auth') || actualPath.startsWith('/auth')) {
      return true;
    }

    //- so khớp quyền từ danh sách permissions của user bằng path-to-regexp
    const permissions = user.role?.permissions || [];

    const hasPermission = permissions.some((p) => {
      if (p.method.toUpperCase() !== method) return false;

      //- so khớp chính xác chuỗi hoặc qua route param pattern /orders/:id
      try {
        const matcher = match(p.apiPath, { decode: decodeURIComponent });
        if (matcher(actualPath)) return true;
      } catch {
        //- bỏ qua nếu format regex pattern bị lỗi
      }

      //- fallback so khớp với route template nếu có (vd: request.route.path)
      if (request.route?.path) {
        try {
          const routeMatcher = match(p.apiPath, { decode: decodeURIComponent });
          if (routeMatcher(request.route.path)) return true;
        } catch {
          //- bỏ qua lỗi format
        }
      }

      return p.apiPath.toLowerCase() === actualPath.toLowerCase();
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này!',
      );
    }

    return true;
  }
}
