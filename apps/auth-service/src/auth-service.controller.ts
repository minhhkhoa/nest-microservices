import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth-service.service';
import { CreatePermissionDto, CreateRoleDto, RegisterDto } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //- kiểm tra đăng nhập email và password
  @MessagePattern({ cmd: 'auth_validate_user' })
  async validateUser(
    @Payload() data: { email: string; password?: string; pass?: string },
  ) {
    const password = data.password || data.pass || '';
    return await this.authService.validateUser(data.email, password);
  }

  @MessagePattern({ cmd: 'auth_register' })
  async register(@Payload() data: RegisterDto) {
    return await this.authService.register(data);
  }

  @MessagePattern({ cmd: 'user_get_with_permissions' })
  async getUserWithPermissions(@Payload() data: { id: string }) {
    return await this.authService.getUserWithPermissions(data.id);
  }

  @MessagePattern({ cmd: 'permission_create' })
  async createPermission(@Payload() data: CreatePermissionDto) {
    return await this.authService.createPermission(data);
  }

  @MessagePattern({ cmd: 'permission_get_all' })
  async getPermissions() {
    return await this.authService.getPermissions();
  }

  @MessagePattern({ cmd: 'role_create' })
  async createRole(@Payload() data: CreateRoleDto) {
    return await this.authService.createRole(data);
  }

  @MessagePattern({ cmd: 'role_get_all' })
  async getRoles() {
    return await this.authService.getRoles();
  }
}
