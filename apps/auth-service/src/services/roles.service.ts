import { CreateRoleDto, Permission, Role, UpdateRoleDto } from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { PermissionRepository } from '../repositories/permission.repository';
import { RoleRepository } from '../repositories/role.repository';

//- service xử lý nghiệp vụ vai trò điều phối trực tiếp role và permission repository
@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  //- tạo vai trò mới kèm gán danh sách quyền hạn
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Mã vai trò [${dto.code}] đã tồn tại!`);
    }

    let permissions: Permission[] = [];
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.findByCondition({
        where: { id: In(dto.permissionIds) },
      });
    }

    return await this.roleRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description || '',
      permissions,
    });
  }

  //- lấy danh sách vai trò phân trang kèm thông tin permissions
  async findAllRoles(
    condition?: ConditionQuery<Role>,
  ): Promise<FindAllResponse<Role>> {
    const finalCondition: ConditionQuery<Role> = {
      ...condition,
      options: {
        ...condition?.options,
        relations: ['permissions'],
      },
    };
    return await this.roleRepository.findAll(finalCondition);
  }

  //- tìm chi tiết vai trò theo id kèm danh sách quyền
  async findRoleById(id: string): Promise<Role> {
    return await this.roleRepository.findByIdOrFail(id, {
      relations: ['permissions'],
    });
  }

  //- cập nhật thông tin vai trò và danh sách quyền hạn
  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    //- kiểm tra nếu đổi mã vai trò thì không được trùng với vai trò khác
    if (dto.code && dto.code !== role.code) {
      const existing = await this.roleRepository.findOne({
        where: { code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Mã vai trò [${dto.code}] đã tồn tại!`);
      }
      role.code = dto.code;
    }

    if (dto.name) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;

    //- cập nhật lại danh sách permissions nếu có truyền lên
    if (dto.permissionIds !== undefined) {
      if (dto.permissionIds.length > 0) {
        role.permissions = await this.permissionRepository.findByCondition({
          where: { id: In(dto.permissionIds) },
        });
      } else {
        role.permissions = [];
      }
    }

    return await this.roleRepository.save(role);
  }

  //- xóa mềm một hoặc nhiều vai trò theo id / mảng ids
  async deleteRole(ids: string | string[]): Promise<boolean> {
    return await this.roleRepository.softDelete(ids);
  }

  //- khôi phục một hoặc nhiều vai trò đã xóa mềm theo id / mảng ids
  async restoreRole(ids: string | string[]): Promise<boolean> {
    return await this.roleRepository.restore(ids);
  }
}
