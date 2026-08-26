import { CreateRoleDto, Role } from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { RolesPermissionsService } from './roles-permissions.service';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesPermissionsService: RolesPermissionsService,
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
