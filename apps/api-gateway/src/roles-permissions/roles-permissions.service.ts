import {
  CreatePermissionDto,
  CreateRoleDto,
  Permission,
  Role,
} from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RolesPermissionsService {
  constructor(
    //- inject tcp client auth_service để quản lý role và permission
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  //- gửi yêu cầu tạo quyền mới
  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    return await firstValueFrom(
      this.authClient.send<Permission>({ cmd: 'permission_create' }, dto),
    );
  }

  //- lấy toàn bộ danh sách permissions
  async getPermissions(): Promise<Permission[]> {
    return await firstValueFrom(
      this.authClient.send<Permission[]>({ cmd: 'permission_get_all' }, {}),
    );
  }

  //- gửi yêu cầu tạo vai trò mới kèm danh sách quyền
  async createRole(dto: CreateRoleDto): Promise<Role> {
    return await firstValueFrom(
      this.authClient.send<Role>({ cmd: 'role_create' }, dto),
    );
  }

  //- lấy toàn bộ danh sách roles
  async getRoles(): Promise<Role[]> {
    return await firstValueFrom(
      this.authClient.send<Role[]>({ cmd: 'role_get_all' }, {}),
    );
  }
}
