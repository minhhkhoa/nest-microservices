import { CreatePermissionDto, Permission } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayRolesPermissionsService } from './gateway-roles-permissions.service';

@Controller('permissions')
export class GatewayPermissionsController {
  constructor(
    private readonly rolesPermissionsService: GatewayRolesPermissionsService,
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
