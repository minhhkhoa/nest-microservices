import {
  CMD_PATTERNS,
  REDIS_KEYS,
  REDIS_TTL,
  RedisService,
  SERVICES,
} from '@app/common';
import type { IUserPayload, IUserPermission, IUserRole } from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

interface JwtPayload {
  sub?: string;
  id?: string;
  email: string;
}

@Injectable()
export class GatewayJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<IUserPayload> {
    //- trích xuất raw token từ header authorization
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      try {
        //- kiểm tra xem token có nằm trong danh sách đen redis do đã đăng xuất hay không
        const isBlacklisted = await this.redisService.exists(
          REDIS_KEYS.AUTH.BLACKLIST_TOKEN(token),
        );
        if (isBlacklisted) {
          throw new UnauthorizedException(
            'Phiên đăng nhập đã bị vô hiệu hóa do đã đăng xuất',
          );
        }
      } catch {
        //- tiếp tục nếu kết nối redis tạm thời bị gián đoạn
      }
    }

    const userId = payload.sub || payload.id;
    if (!userId) {
      throw new UnauthorizedException('Token không hợp lệ (thiếu user id)');
    }

    //- bước 1: thử lấy thông tin user profile từ redis cache (tầng 1)
    let userProfile: IUserPayload | null = null;
    try {
      userProfile = await this.redisService.getJson<IUserPayload>(
        REDIS_KEYS.AUTH.USER(userId),
      );
    } catch {
      //- nếu redis gặp sự cố, bỏ qua để fallback sang tcp gọi auth-service
    }

    //- nếu tìm thấy user profile trong redis cache
    if (userProfile) {
      if (!userProfile.isActive) {
        throw new UnauthorizedException(
          'Người dùng không tồn tại hoặc đã bị khóa',
        );
      }

      const roleCode = userProfile.role?.code;
      let permissions: IUserPermission[] | null = null;

      //- bước 2: thử lấy danh sách quyền hạn của vai trò từ redis cache (tầng 2)
      if (roleCode) {
        try {
          permissions = await this.redisService.getJson<IUserPermission[]>(
            REDIS_KEYS.AUTH.ROLE_PERMISSIONS(roleCode),
          );
        } catch {
          //- bỏ qua nếu redis gặp sự cố
        }

        //- nếu cache miss danh sách quyền (do admin vừa sửa role), gọi tcp lấy riêng quyền của role đó
        if (!permissions) {
          try {
            permissions = await firstValueFrom(
              this.authClient.send<IUserPermission[]>(
                { cmd: CMD_PATTERNS.ROLE.GET_PERMISSIONS_BY_CODE },
                { code: roleCode },
              ),
            );

            if (permissions) {
              await this.redisService.setJson(
                REDIS_KEYS.AUTH.ROLE_PERMISSIONS(roleCode),
                permissions,
                REDIS_TTL.ROLE_PERMISSIONS,
              );
            }
          } catch {
            permissions = [];
          }
        }
      }

      //- ghép user profile và danh sách quyền thành đối tượng user hoàn chỉnh
      return {
        ...userProfile,
        role: {
          ...userProfile.role,
          permissions: permissions || [],
        },
      };
    }

    //- bước 3: nếu cache miss toàn bộ user profile, gọi sang auth-service qua tcp và nạp cả 2 tầng cache
    const fullUser = await firstValueFrom(
      this.authClient.send<IUserPayload | null>(
        { cmd: CMD_PATTERNS.AUTH.GET_USER_WITH_PERMISSIONS },
        { id: userId },
      ),
    );

    if (!fullUser || !fullUser.isActive) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc đã bị khóa',
      );
    }

    //- nạp dữ liệu vào redis theo mô hình 2 tầng
    try {
      const { role, ...rest } = fullUser;
      const rolePermissions = role?.permissions || [];
      const cleanRole: IUserRole = {
        ...role,
        permissions: [], //- tầng user profile không cần lưu mảng permissions để tiết kiệm dung lượng
      };
      const cleanUserProfile: IUserPayload = {
        ...rest,
        role: cleanRole,
      };

      //- lưu tầng 1: user profile (ttl 15 phút)
      await this.redisService.setJson(
        REDIS_KEYS.AUTH.USER(userId),
        cleanUserProfile,
        REDIS_TTL.USER_PROFILE,
      );

      //- lưu tầng 2: role permissions (ttl 24 giờ)
      if (role?.code) {
        await this.redisService.setJson(
          REDIS_KEYS.AUTH.ROLE_PERMISSIONS(role.code),
          rolePermissions,
          REDIS_TTL.ROLE_PERMISSIONS,
        );
      }
    } catch {
      //- bỏ qua nếu ghi redis cache thất bại
    }

    return fullUser; //- gắn vào req.user để permission.guard sử dụng
  }
}
