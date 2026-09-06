import {
  CMD_PATTERNS,
  ConditionQuery,
  CreatePermissionDto,
  CreateRoleDto,
  FindAllResponse,
  Permission,
  Role,
  SERVICES,
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
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  // ================= ROLES =================
  //- gửi yêu cầu tạo vai trò mới kèm danh sách quyền
  async createRole(dto: CreateRoleDto): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>({ cmd: CMD_PATTERNS.ROLE.CREATE }, dto),
    );
  }

  //- lấy danh sách vai trò phân trang và tìm kiếm
  async getRoles(
    condition?: ConditionQuery<Role>,
  ): Promise<FindAllResponse<Role>> {
    return await firstValueFrom(
      this.authClient.send<FindAllResponse<Role>>(
        { cmd: CMD_PATTERNS.ROLE.FIND_ALL },
        condition || {},
      ),
    );
  }

  //- lấy chi tiết vai trò theo id
  async getRoleById(id: string): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>({ cmd: CMD_PATTERNS.ROLE.FIND_BY_ID }, { id }),
    );
  }

  //- cập nhật vai trò
  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>(
        { cmd: CMD_PATTERNS.ROLE.UPDATE },
        { id, dto },
      ),
    );
  }

  //- xóa mềm một hoặc nhiều vai trò
  async deleteRole(ids: string | string[]): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>({ cmd: CMD_PATTERNS.ROLE.DELETE }, { ids }),
    );
  }

  //- khôi phục một hoặc nhiều vai trò
  async restoreRole(ids: string | string[]): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>(
        { cmd: CMD_PATTERNS.ROLE.RESTORE },
        { ids },
      ),
    );
  }

  // ================= PERMISSIONS =================
  //- gửi yêu cầu tạo quyền mới
  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    return await firstValueFrom(
      this.authClient.send<Permission>(
        { cmd: CMD_PATTERNS.PERMISSION.CREATE },
        dto,
      ),
    );
  }

  //- lấy danh sách quyền hạn phân trang và tìm kiếm
  async getPermissions(
    condition?: ConditionQuery<Permission>,
  ): Promise<FindAllResponse<Permission>> {
    return await firstValueFrom(
      this.authClient.send<FindAllResponse<Permission>>(
        { cmd: CMD_PATTERNS.PERMISSION.FIND_ALL },
        condition || {},
      ),
    );
  }

  //- lấy chi tiết quyền hạn theo id
  async getPermissionById(id: string): Promise<Permission> {
    return await firstValueFrom(
      this.authClient.send<Permission>(
        { cmd: CMD_PATTERNS.PERMISSION.FIND_BY_ID },
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
        { cmd: CMD_PATTERNS.PERMISSION.UPDATE },
        { id, dto },
      ),
    );
  }

  //- xóa mềm một hoặc nhiều quyền hạn
  async deletePermission(ids: string | string[]): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>(
        { cmd: CMD_PATTERNS.PERMISSION.DELETE },
        { ids },
      ),
    );
  }

  //- khôi phục một hoặc nhiều quyền hạn
  async restorePermission(ids: string | string[]): Promise<boolean> {
    return await firstValueFrom(
      this.authClient.send<boolean>(
        { cmd: CMD_PATTERNS.PERMISSION.RESTORE },
        { ids },
      ),
    );
  }
}
