import {
  ApiCustomResponse,
  ApiPaginationQuery,
  ApiPaginationResponse,
  CreatePermissionDto,
  Permission,
  QueryFiltered,
  ResponseMessage,
  UpdatePermissionDto,
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

  //- lấy danh sách quyền trong hệ thống có phân trang và tìm kiếm
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách quyền hạn (hỗ trợ phân trang, lọc & tìm kiếm)',
  })
  @ApiPaginationQuery()
  @ResponseMessage('Lấy danh sách quyền thành công')
  @ApiPaginationResponse({
    type: Permission,
    description: 'Lấy danh sách quyền thành công',
  })
  async getPermissions(
    @QueryFiltered() condition: ConditionQuery<Permission>,
  ): Promise<FindAllResponse<Permission>> {
    return await this.rolesPermissionsService.getPermissions(condition);
  }

  //- lấy chi tiết quyền hạn theo id
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết quyền hạn theo ID' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh quyền hạn (UUID)',
    example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @ResponseMessage('Lấy chi tiết quyền thành công')
  @ApiCustomResponse({
    type: Permission,
    description: 'Chi tiết thông tin quyền hạn',
  })
  async getPermissionById(@Param('id') id: string): Promise<Permission> {
    return await this.rolesPermissionsService.getPermissionById(id);
  }

  //- cập nhật quyền hạn
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin quyền hạn' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh quyền hạn (UUID)',
    example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @ApiBody({
    type: UpdatePermissionDto,
    description: 'Thông tin cập nhật quyền hạn',
  })
  @ResponseMessage('Cập nhật quyền thành công')
  @ApiCustomResponse({
    type: Permission,
    description: 'Cập nhật quyền hạn thành công',
  })
  async updatePermission(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ): Promise<Permission> {
    return await this.rolesPermissionsService.updatePermission(id, dto);
  }

  //- xóa mềm quyền hạn
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm quyền hạn khỏi hệ thống' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh quyền hạn (UUID)',
    example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @ResponseMessage('Xóa quyền thành công')
  @ApiCustomResponse({ description: 'Xóa quyền thành công' })
  async deletePermission(@Param('id') id: string) {
    await this.rolesPermissionsService.deletePermission(id);
    return {
      deleted: true,
      id,
    };
  }

  //- khôi phục quyền hạn đã xóa mềm
  @Post(':id/restore')
  @ApiOperation({ summary: 'Khôi phục quyền hạn đã bị xóa mềm' })
  @ApiParam({
    name: 'id',
    description: 'ID định danh quyền hạn (UUID)',
    example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @ResponseMessage('Khôi phục quyền thành công')
  @ApiCustomResponse({ description: 'Khôi phục quyền thành công' })
  async restorePermission(@Param('id') id: string) {
    await this.rolesPermissionsService.restorePermission(id);
    return {
      restored: true,
      id,
    };
  }
}
