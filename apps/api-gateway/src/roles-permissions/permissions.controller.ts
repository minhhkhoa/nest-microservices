import { CreatePermissionDto, Permission } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { RolesPermissionsService } from './roles-permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  //- tạo quyền mới trong hệ thống
  @Post()
  async createPermission(
    @Body() dto: CreatePermissionDto,
  ): Promise<Permission> {
    return await this.rolesPermissionsService.createPermission(dto);
  }

  //- lấy toàn bộ danh sách quyền trong hệ thống
  @Get()
  async getPermissions(): Promise<Permission[]> {
    return await this.rolesPermissionsService.getPermissions();
  }
}
