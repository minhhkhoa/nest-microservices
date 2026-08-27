import {
  ConditionQuery,
  CreatePermissionDto,
  CreateRoleDto,
  FindAllResponse,
  Permission,
  Role,
  UpdatePermissionDto,
  UpdateRoleDto,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayRolesPermissionsService {
  constructor(
    //- inject tcp client auth_service để giao tiếp microservice
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  // ================= ROLES =================
  //- gửi yêu cầu tạo vai trò mới kèm danh sách quyền
  async createRole(dto: CreateRoleDto): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>({ cmd: 'role_create' }, dto),
    );
  }

  //- lấy danh sách vai trò phân trang và tìm kiếm
  async getRoles(
    condition?: ConditionQuery<Role>,
  ): Promise<FindAllResponse<Role>> {
    return await firstValueFrom(
      this.authClient.send<FindAllResponse<Role>>(
        { cmd: 'role_find_all' },
        condition || {},
      ),
    );
  }

  //- lấy chi tiết vai trò theo id
  async getRoleById(id: string): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>({ cmd: 'role_find_by_id' }, { id }),
    );
  }

  //- cập nhật vai trò
  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>({ cmd: 'role_update' }, { id, dto }),
    );
  }

  //- xóa mềm vai trò
  async deleteRole(id: string): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>({ cmd: 'role_delete' }, { id }),
    );
  }

  //- khôi phục vai trò
  async restoreRole(id: string): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>({ cmd: 'role_restore' }, { id }),
    );
  }

  // ================= PERMISSIONS =================
  //- gửi yêu cầu tạo quyền mới
  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    return await firstValueFrom(
      this.authClient.send<Permission>({ cmd: 'permission_create' }, dto),
    );
  }

  //- lấy danh sách quyền hạn phân trang và tìm kiếm
  async getPermissions(
    condition?: ConditionQuery<Permission>,
  ): Promise<FindAllResponse<Permission>> {
    return await firstValueFrom(
      this.authClient.send<FindAllResponse<Permission>>(
        { cmd: 'permission_find_all' },
        condition || {},
      ),
    );
  }

  //- lấy chi tiết quyền hạn theo id
  async getPermissionById(id: string): Promise<Permission> {
    return await firstValueFrom(
      this.authClient.send<Permission>(
        { cmd: 'permission_find_by_id' },
        { id },
      ),
    );
  }

  //- cập nhật quyền hạn
  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    return await firstValueFrom(
      this.authClient.send<Permission>(
        { cmd: 'permission_update' },
        { id, dto },
      ),
    );
  }

  //- xóa mềm quyền hạn
  async deletePermission(id: string): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>({ cmd: 'permission_delete' }, { id }),
    );
  }

  //- khôi phục quyền hạn
  async restorePermission(id: string): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>({ cmd: 'permission_restore' }, { id }),
    );
  }
}
