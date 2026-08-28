import {
  CUSTOMER_PERMISSION_CODES,
  DEFAULT_PERMISSIONS,
  ROLE_ADMIN,
  ROLE_CUSTOMER,
  hashPassword,
} from '@app/common';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionRepository } from '../repositories/permission.repository';
import { RoleRepository } from '../repositories/role.repository';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthSeederService.name);

  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log(
      '--- Bắt đầu tiến trình kiểm tra và khởi tạo dữ liệu RBAC (Seeder) ---',
    );
    try {
      await this.seedPermissions();
      await this.seedRoles();
      await this.seedSuperAdmin();
      this.logger.log('--- Hoàn tất khởi tạo dữ liệu RBAC thành công ---');
    } catch (error) {
      this.logger.error('Lỗi khi thực thi khởi tạo dữ liệu RBAC:', error);
    }
  }

  //- khởi tạo hoặc đồng bộ danh sách permissions mặc định vào csdl
  private async seedPermissions() {
    this.logger.log(
      `Đang kiểm tra và đồng bộ ${DEFAULT_PERMISSIONS.length} permissions...`,
    );
    for (const item of DEFAULT_PERMISSIONS) {
      const existing = await this.permissionRepository.findOne({
        where: { code: item.code },
      });

      if (!existing) {
        await this.permissionRepository.create({
          code: item.code,
          name: item.name,
          apiPath: item.apiPath,
          method: item.method,
          module: item.module,
        });
      } else {
        //- cập nhật lại đường dẫn và tên nếu có thay đổi
        existing.name = item.name;
        existing.apiPath = item.apiPath;
        existing.method = item.method;
        existing.module = item.module;
        await this.permissionRepository.save(existing);
      }
    }
    this.logger.log('Đã đồng bộ toàn bộ permissions thành công');
  }

  //- khởi tạo 2 vai trò admin và customer cùng danh sách quyền tương ứng
  private async seedRoles() {
    const adminRoleCode =
      this.configService.get<string>('DEFAULT_ADMIN_ROLE') || ROLE_ADMIN;
    const customerRoleCode =
      this.configService.get<string>('DEFAULT_CUSTOMER_ROLE') || ROLE_CUSTOMER;

    //- lấy toàn bộ permissions hiện có trong database
    const allPermissions = await this.permissionRepository.findByCondition();

    //- khởi tạo hoặc cập nhật role admin
    let adminRole = await this.roleRepository.findOne({
      where: { code: adminRoleCode },
      relations: ['permissions'],
    });

    if (!adminRole) {
      adminRole = await this.roleRepository.create({
        code: adminRoleCode,
        name: 'Quản trị viên',
        description: 'Toàn quyền quản trị toàn bộ các chức năng của hệ thống',
        permissions: allPermissions,
      });
      this.logger.log(`Tạo mới vai trò [${adminRoleCode}] thành công`);
    } else {
      adminRole.permissions = allPermissions;
      await this.roleRepository.save(adminRole);
    }

    //- khởi tạo hoặc cập nhật role customer. Sau này có thể add thủ công trên UI
    const customerPermissions = allPermissions.filter((p) =>
      CUSTOMER_PERMISSION_CODES.includes(p.code),
    );

    let customerRole = await this.roleRepository.findOne({
      where: { code: customerRoleCode },
      relations: ['permissions'],
    });

    if (!customerRole) {
      customerRole = await this.roleRepository.create({
        code: customerRoleCode,
        name: 'Khách hàng',
        description: 'Người dùng mua sắm và tạo đơn hàng',
        permissions: customerPermissions,
      });
      this.logger.log(`Tạo mới vai trò [${customerRoleCode}] thành công`);
    } else {
      customerRole.permissions = customerPermissions;
      await this.roleRepository.save(customerRole);
    }
  }

  //- khởi tạo tài khoản quản trị viên admin mặc định nếu chưa tồn tại
  private async seedSuperAdmin() {
    const adminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>(
      'DEFAULT_ADMIN_PASSWORD',
    )!;
    const adminName = this.configService.get<string>('DEFAULT_ADMIN_NAME');
    const adminRoleCode =
      this.configService.get<string>('DEFAULT_ADMIN_ROLE') || ROLE_ADMIN;

    const existingUser = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role'],
    });

    const adminRole = await this.roleRepository.findOne({
      where: { code: adminRoleCode },
    });

    if (!adminRole) {
      this.logger.error(
        `Không tìm thấy vai trò [${adminRoleCode}] để gán cho admin`,
      );
      return;
    }

    if (!existingUser) {
      const hashedPassword = await hashPassword(adminPassword);
      await this.userRepository.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: adminRole,
        isActive: true,
      });
      this.logger.log(
        `Tạo tài khoản quản trị viên mặc định [${adminEmail}] thành công`,
      );
    } else if (existingUser.role?.code !== adminRoleCode) {
      //- nếu admin đã tồn tại nhưng chưa gán đúng role admin
      existingUser.role = adminRole;
      await this.userRepository.save(existingUser);
      this.logger.log(
        `Cập nhật vai trò quản trị viên cho tài khoản [${adminEmail}] thành công`,
      );
    }
  }
}
