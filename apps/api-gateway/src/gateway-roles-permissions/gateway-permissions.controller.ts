import {
  ApiCustomResponse,
  CreatePermissionDto,
  Permission,
  ResponseMessage,
} from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayRolesPermissionsService } from './gateway-roles-permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
export class GatewayPermissionsController {
  constructor(
    private readonly rolesPermissionsService: GatewayRolesPermissionsService,
  ) {}

  //- tạo quyền mới trong hệ thống
  @Post()
  @ApiOperation({ summary: 'Tạo quyền mới' })
  @ApiBody({
    type: CreatePermissionDto,
    description: 'Thông tin quyền hạn cần tạo',
  })
  @ResponseMessage('Tạo quyền mới thành công')
  @ApiCustomResponse({
    type: Permission,
    status: 201,
    description: 'Tạo quyền mới thành công',
  })
  async createPermission(
    @Body() dto: CreatePermissionDto,
  ): Promise<Permission> {
    return await this.rolesPermissionsService.createPermission(dto);
  }

  //- lấy toàn bộ danh sách quyền trong hệ thống
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các quyền' })
  @ResponseMessage('Lấy danh sách quyền thành công')
  @ApiCustomResponse({
    type: Permission,
    isArray: true,
    description: 'Danh sách quyền',
  })
  async getPermissions(): Promise<Permission[]> {
    return await this.rolesPermissionsService.getPermissions();
  }
}
