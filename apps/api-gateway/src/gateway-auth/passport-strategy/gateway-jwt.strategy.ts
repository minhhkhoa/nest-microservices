import {
  CMD_PATTERNS,
  REDIS_KEYS,
  REDIS_TTL,
  RedisService,
  SERVICES,
} from '@app/common';
import type { IUserPayload } from '@app/common';
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

    //- bước 1: thử lấy thông tin user kèm quyền hạn từ redis cache
    let user: IUserPayload | null = null;
    try {
      user = await this.redisService.getJson<IUserPayload>(
        REDIS_KEYS.AUTH.USER_PERMISSIONS(userId),
      );
    } catch {
      //- nếu redis gặp sự cố, bỏ qua lỗi để fallback gọi tcp sang auth-service
    }

    //- bước 2: nếu cache miss, gọi sang auth-service qua tcp và nạp lại vào cache redis
    if (!user) {
      user = await firstValueFrom(
        this.authClient.send<IUserPayload | null>(
          { cmd: CMD_PATTERNS.AUTH.GET_USER_WITH_PERMISSIONS },
          { id: userId },
        ),
      );

      //- nếu tìm thấy user hợp lệ, ghi vào redis cache với ttl định sẵn
      if (user && user.isActive) {
        try {
          await this.redisService.setJson(
            REDIS_KEYS.AUTH.USER_PERMISSIONS(userId),
            user,
            REDIS_TTL.USER_PERMISSIONS,
          );
        } catch {
          //- bỏ qua nếu ghi redis cache thất bại
        }
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc đã bị khóa',
      );
    }

    return user; //- gắn vào req.user để permission.guard sử dụng
  }
}
