import { CreateRoleDto, Role } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayRolesPermissionsService } from './gateway-roles-permissions.service';

@Controller('roles')
export class GatewayRolesController {
  constructor(
    private readonly rolesPermissionsService: GatewayRolesPermissionsService,
  ) {}

  //- tạo vai trò mới và gán danh sách quyền
  @Post()
  async createRole(@Body() dto: CreateRoleDto): Promise<Role> {
    return await this.rolesPermissionsService.createRole(dto);
  }

  //- lấy toàn bộ danh sách vai trò
  @Get()
  async getRoles(): Promise<Role[]> {
    return await this.rolesPermissionsService.getRoles();
  }
}
