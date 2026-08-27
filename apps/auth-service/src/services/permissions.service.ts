import {
  BaseServiceAbstract,
  CreatePermissionDto,
  Permission,
  UpdatePermissionDto,
} from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';

//- service xử lý nghiệp vụ quyền hạn kế thừa base service abstract
@Injectable()
export class PermissionsService extends BaseServiceAbstract<Permission> {
  constructor(private readonly permissionRepository: PermissionRepository) {
    super(permissionRepository);
  }

  //- tạo quyền hạn mới
  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Mã quyền hạn [${dto.code}] đã tồn tại!`);
    }

    return await this.create({
      code: dto.code,
      name: dto.name,
      apiPath: dto.apiPath,
      method: dto.method.toUpperCase(),
      module: dto.module.toUpperCase(),
    });
  }

  //- cập nhật quyền hạn
  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    const perm = await this.findByIdOrFail(id);

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

    return await this.permissionRepository.save(perm);
  }
}
