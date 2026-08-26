import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  IS_PUBLIC_KEY,
  IS_PUBLIC_PERMISSION_KEY,
} from '../decorators/customize.decorator';
import { User } from '../entities/auth/user.entity';

interface AuthenticatedRequest {
  user?: User;
  method: string;
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

    //- bypass cho super admin
    if (user.role?.code === 'SUPER_ADMIN') {
      return true;
    }

    //- lấy method và đường dẫn route hiện tại
    const method = request.method.toUpperCase();
    const routePath = request.route?.path; //- dạng /api/v1/users/:id

    //- bypass mặc định cho các route /api/auth
    if (routePath?.startsWith('/api/auth') || routePath?.startsWith('/auth')) {
      return true;
    }

    //- so khớp quyền từ danh sách permissions của user
    const permissions = user.role?.permissions || [];

    const hasPermission = permissions.some(
      (p) =>
        p.method.toUpperCase() === method &&
        p.apiPath.toLowerCase() === routePath?.toLowerCase(),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này!',
      );
    }

    return true;
  }
}
