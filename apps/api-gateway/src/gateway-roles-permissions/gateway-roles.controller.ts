import {
  ApiCustomResponse,
  CreateRoleDto,
  ResponseMessage,
  Role,
} from '@app/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GatewayRolesPermissionsService } from './gateway-roles-permissions.service';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class GatewayRolesController {
  constructor(
    private readonly rolesPermissionsService: GatewayRolesPermissionsService,
  ) {}

  //- tạo vai trò mới và gán danh sách quyền
  @Post()
  @ApiOperation({ summary: 'Tạo vai trò mới' })
  @ApiBody({ type: CreateRoleDto, description: 'Thông tin vai trò cần tạo' })
  @ResponseMessage('Tạo vai trò mới thành công')
  @ApiCustomResponse({
    type: Role,
    status: 201,
    description: 'Tạo vai trò mới thành công',
  })
  async createRole(@Body() dto: CreateRoleDto): Promise<Role> {
    return await this.rolesPermissionsService.createRole(dto);
  }

  //- lấy toàn bộ danh sách vai trò
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các vai trò' })
  @ResponseMessage('Lấy danh sách vai trò thành công')
  @ApiCustomResponse({
    type: Role,
    isArray: true,
    description: 'Danh sách vai trò',
  })
  async getRoles(): Promise<Role[]> {
    return await this.rolesPermissionsService.getRoles();
  }
}
