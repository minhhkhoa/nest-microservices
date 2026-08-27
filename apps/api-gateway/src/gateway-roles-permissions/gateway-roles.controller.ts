import {
  ApiCustomResponse,
  ApiPaginationQuery,
  ApiPaginationResponse,
  CreateRoleDto,
  QueryFiltered,
  ResponseMessage,
  Role,
  UpdateRoleDto,
} from '@app/common';
import type { ConditionQuery, FindAllResponse } from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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

  //- lấy danh sách vai trò có phân trang, lọc và tìm kiếm
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách vai trò (hỗ trợ phân trang, lọc & tìm kiếm)',
  })
  @ApiPaginationQuery()
  @ResponseMessage('Lấy danh sách vai trò thành công')
  @ApiPaginationResponse({
    type: Role,
    description: 'Lấy danh sách vai trò thành công',
  })
  async getRoles(
    @QueryFiltered() condition: ConditionQuery<Role>,
  ): Promise<FindAllResponse<Role>> {
    return await this.rolesPermissionsService.getRoles(condition);
  }

  //- lấy chi tiết vai trò theo id
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết vai trò theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh vai trò (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ResponseMessage('Lấy chi tiết vai trò thành công')
  @ApiCustomResponse({
    type: Role,
    description: 'Chi tiết thông tin vai trò',
  })
  async getRoleById(@Param('id') id: string): Promise<Role> {
    return await this.rolesPermissionsService.getRoleById(id);
  }

  //- cập nhật vai trò
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin vai trò và danh sách quyền' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh vai trò (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ApiBody({ type: UpdateRoleDto, description: 'Thông tin cập nhật vai trò' })
  @ResponseMessage('Cập nhật vai trò thành công')
  @ApiCustomResponse({
    type: Role,
    description: 'Cập nhật vai trò thành công',
  })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<Role> {
    return await this.rolesPermissionsService.updateRole(id, dto);
  }

  //- xóa mềm vai trò
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm vai trò khỏi hệ thống' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh vai trò (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ResponseMessage('Xóa vai trò thành công')
  @ApiCustomResponse({ description: 'Xóa vai trò thành công' })
  async deleteRole(@Param('id') id: string) {
    await this.rolesPermissionsService.deleteRole(id);
    return {
      deleted: true,
      id,
    };
  }

  //- khôi phục vai trò đã xóa mềm
  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục vai trò đã bị xóa mềm' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh vai trò (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @ResponseMessage('Khôi phục vai trò thành công')
  @ApiCustomResponse({ description: 'Khôi phục vai trò thành công' })
  async restoreRole(@Param('id') id: string) {
    await this.rolesPermissionsService.restoreRole(id);
    return {
      restored: true,
      id,
    };
  }
}
