import {
  CMD_PATTERNS,
  CreatePermissionDto,
  CreateRoleDto,
  Permission,
  RegisterDto,
  Role,
  UpdatePermissionDto,
  UpdateRoleDto,
} from '@app/common';
import type { ConditionQuery } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth-service.service';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  //- kiểm tra đăng nhập email và password
  @MessagePattern({ cmd: CMD_PATTERNS.AUTH.VALIDATE_USER })
  async validateUser(
    @Payload() data: { email: string; password?: string; pass?: string },
  ) {
    const password = data.password || data.pass || '';
    return await this.authService.validateUser(data.email, password);
  }

  //- đăng ký tài khoản
  @MessagePattern({ cmd: CMD_PATTERNS.AUTH.REGISTER })
  async register(@Payload() data: RegisterDto) {
    return await this.authService.register(data);
  }

  //- lấy thông tin tài khoản kèm quyền hạn phục vụ jwt strategy
  @MessagePattern({ cmd: CMD_PATTERNS.AUTH.GET_USER_WITH_PERMISSIONS })
  async getUserWithPermissions(@Payload() data: { id: string }) {
    return await this.authService.getUserWithPermissions(data.id);
  }

  //- đăng nhập và sinh cặp token cho tài khoản
  @MessagePattern({ cmd: CMD_PATTERNS.AUTH.LOGIN })
  async login(@Payload() data: { userId: string }) {
    return await this.authService.login(data.userId);
  }

  //- làm mới access token và xoay vòng refresh token
  @MessagePattern({ cmd: CMD_PATTERNS.AUTH.REFRESH_TOKEN })
  async refreshTokens(@Payload() data: { refreshToken: string }) {
    return await this.authService.refreshTokens(data.refreshToken);
  }

  //- đăng xuất tài khoản, thu hồi refresh token và đưa access token vào redis blacklist
  @MessagePattern({ cmd: CMD_PATTERNS.AUTH.LOGOUT })
  async logout(@Payload() data: { userId: string; accessToken?: string }) {
    return await this.authService.logout(data.userId, data.accessToken);
  }

  // ================= ROLE PATTERNS =================
  //- tạo vai trò mới
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.CREATE })
  async createRole(@Payload() data: CreateRoleDto) {
    return await this.rolesService.createRole(data);
  }

  //- lấy danh sách vai trò phân trang và tìm kiếm
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.FIND_ALL })
  async getRoles(@Payload() condition?: ConditionQuery<Role>) {
    return await this.rolesService.findAllRoles(condition);
  }

  //- lấy chi tiết vai trò theo id
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.FIND_BY_ID })
  async getRoleById(@Payload() data: { id: string }) {
    return await this.rolesService.findRoleById(data.id);
  }

  //- lấy danh sách quyền hạn theo mã vai trò
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.GET_PERMISSIONS_BY_CODE })
  async getPermissionsByRoleCode(@Payload() data: { code: string }) {
    return await this.rolesService.getPermissionsByRoleCode(data.code);
  }

  //- cập nhật vai trò
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.UPDATE })
  async updateRole(@Payload() data: { id: string; dto: UpdateRoleDto }) {
    return await this.rolesService.updateRole(data.id, data.dto);
  }

  //- xóa mềm một hoặc nhiều vai trò (nhận id đơn lẻ hoặc mảng ids)
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.DELETE })
  async deleteRole(
    @Payload()
    data: { id?: string | string[]; ids?: string[] } | string | string[],
  ) {
    const ids =
      typeof data === 'object' && !Array.isArray(data)
        ? (data.ids ?? data.id ?? [])
        : data;
    return await this.rolesService.deleteRole(ids);
  }

  //- khôi phục một hoặc nhiều vai trò đã xóa mềm (nhận id đơn lẻ hoặc mảng ids)
  @MessagePattern({ cmd: CMD_PATTERNS.ROLE.RESTORE })
  async restoreRole(
    @Payload()
    data: { id?: string | string[]; ids?: string[] } | string | string[],
  ) {
    const ids =
      typeof data === 'object' && !Array.isArray(data)
        ? (data.ids ?? data.id ?? [])
        : data;
    return await this.rolesService.restoreRole(ids);
  }

  // ================= PERMISSION PATTERNS =================
  //- tạo quyền hạn mới
  @MessagePattern({ cmd: CMD_PATTERNS.PERMISSION.CREATE })
  async createPermission(@Payload() data: CreatePermissionDto) {
    return await this.permissionsService.createPermission(data);
  }

  //- lấy danh sách quyền hạn phân trang và tìm kiếm
  @MessagePattern({ cmd: CMD_PATTERNS.PERMISSION.FIND_ALL })
  async getPermissions(@Payload() condition?: ConditionQuery<Permission>) {
    return await this.permissionsService.findAllPermissions(condition);
  }

  //- lấy chi tiết quyền hạn theo id
  @MessagePattern({ cmd: CMD_PATTERNS.PERMISSION.FIND_BY_ID })
  async getPermissionById(@Payload() data: { id: string }) {
    return await this.permissionsService.findPermissionById(data.id);
  }

  //- cập nhật quyền hạn
  @MessagePattern({ cmd: CMD_PATTERNS.PERMISSION.UPDATE })
  async updatePermission(
    @Payload() data: { id: string; dto: UpdatePermissionDto },
  ) {
    return await this.permissionsService.updatePermission(data.id, data.dto);
  }

  //- xóa mềm một hoặc nhiều quyền hạn (nhận id đơn lẻ hoặc mảng ids)
  @MessagePattern({ cmd: CMD_PATTERNS.PERMISSION.DELETE })
  async deletePermission(
    @Payload()
    data: { id?: string | string[]; ids?: string[] } | string | string[],
  ) {
    const ids =
      typeof data === 'object' && !Array.isArray(data)
        ? (data.ids ?? data.id ?? [])
        : data;
    return await this.permissionsService.deletePermission(ids);
  }

  //- khôi phục một hoặc nhiều quyền hạn đã xóa mềm (nhận id đơn lẻ hoặc mảng ids)
  @MessagePattern({ cmd: CMD_PATTERNS.PERMISSION.RESTORE })
  async restorePermission(
    @Payload()
    data: { id?: string | string[]; ids?: string[] } | string | string[],
  ) {
    const ids =
      typeof data === 'object' && !Array.isArray(data)
        ? (data.ids ?? data.id ?? [])
        : data;
    return await this.permissionsService.restorePermission(ids);
  }
}
