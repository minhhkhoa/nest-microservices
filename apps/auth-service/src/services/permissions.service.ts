import {
  CreatePermissionDto,
  Permission,
  REDIS_KEYS,
  RedisService,
  UpdatePermissionDto,
} from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';

//- service xử lý nghiệp vụ quyền hạn gọi trực tiếp permission repository
@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly redisService: RedisService,
  ) {}

  //- tạo quyền hạn mới
  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Mã quyền hạn [${dto.code}] đã tồn tại!`);
    }

    return await this.permissionRepository.create({
      code: dto.code,
      name: dto.name,
      apiPath: dto.apiPath,
      method: dto.method.toUpperCase(),
      module: dto.module.toUpperCase(),
    });
  }

  //- lấy danh sách quyền hạn phân trang và tìm kiếm
  async findAllPermissions(
    condition?: ConditionQuery<Permission>,
  ): Promise<FindAllResponse<Permission>> {
    return await this.permissionRepository.findAll(condition);
  }

  //- lấy chi tiết quyền hạn theo id
  async findPermissionById(id: string): Promise<Permission> {
    return await this.permissionRepository.findByIdOrFail(id);
  }

  //- cập nhật quyền hạn
  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    const perm = await this.permissionRepository.findByIdOrFail(id);

    if (dto.code && dto.code !== perm.code) {
      const existing = await this.permissionRepository.findOne({
        where: { code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Mã quyền hạn [${dto.code}] đã tồn tại!`);
      }
      perm.code = dto.code;
    }

    if (dto.name) perm.name = dto.name;
    if (dto.apiPath) perm.apiPath = dto.apiPath;
    if (dto.method) perm.method = dto.method.toUpperCase();
    if (dto.module) perm.module = dto.module.toUpperCase();

    const saved = await this.permissionRepository.save(perm);

    //- xóa toàn bộ cache user permissions trên redis để các user cập nhật quyền tức thì
    try {
      await this.redisService.delByPattern(
        REDIS_KEYS.AUTH.USER_PERMISSIONS_PREFIX,
      );
    } catch {
      //- bỏ qua nếu redis gặp sự cố
    }

    return saved;
  }

  //- xóa mềm một hoặc nhiều quyền hạn theo id / mảng ids
  async deletePermission(ids: string | string[]): Promise<boolean> {
    const result = await this.permissionRepository.softDelete(ids);

    //- xóa cache user permissions trên redis
    try {
      await this.redisService.delByPattern(
        REDIS_KEYS.AUTH.USER_PERMISSIONS_PREFIX,
      );
    } catch {
      //- bỏ qua nếu redis gặp sự cố
    }

    return result;
  }

  //- khôi phục một hoặc nhiều quyền hạn đã xóa mềm theo id / mảng ids
  async restorePermission(ids: string | string[]): Promise<boolean> {
    const result = await this.permissionRepository.restore(ids);

    //- xóa cache user permissions trên redis
    try {
      await this.redisService.delByPattern(
        REDIS_KEYS.AUTH.USER_PERMISSIONS_PREFIX,
      );
    } catch {
      //- bỏ qua nếu redis gặp sự cố
    }

    return result;
  }
}
