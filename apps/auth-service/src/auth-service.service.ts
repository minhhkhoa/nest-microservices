import {
  Permission,
  Role,
  User,
  comparePassword,
  hashPassword,
} from '@app/common';
import {
  RegisterDto,
  CreateRoleDto,
  CreatePermissionDto,
} from '@app/common/dtos/auth/auth.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  //- kiểm tra email và mật khẩu khi đăng nhập
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) return null;

    //- so sánh mật khẩu mã hóa bcrypt
    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) return null;

    //- loại bỏ password trước khi trả về
    const { password, ...result } = user;
    return result;
  }

  //- đăng ký tài khoản mới
  async register(registerDto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new Error('Email này đã tồn tại');
    }

    //- băm mật khẩu
    const hashedPassword = await hashPassword(registerDto.password);

    //- tìm role mặc định nếu không truyền lên
    const roleCode = registerDto.roleCode || 'CUSTOMER';
    let role = await this.roleRepo.findOne({ where: { code: roleCode } });
    if (!role) {
      //- nếu chưa có thì tự khởi tạo role
      role = await this.roleRepo.save({ code: roleCode, name: roleCode });
    }

    const newUser = this.userRepo.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: role,
    });

    const saved = await this.userRepo.save(newUser);
    const { password, ...result } = saved;
    return result;
  }

  //- lấy thông tin user kèm đầy đủ role và permissions (dùng cho jwt strategy)
  async getUserWithPermissions(userId: string) {
    return await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });
  }

  //- quản lý permissions
  async createPermission(dto: CreatePermissionDto) {
    const perm = this.permissionRepo.create(dto);
    return await this.permissionRepo.save(perm);
  }

  async getPermissions() {
    return await this.permissionRepo.find();
  }

  //- quản lý roles
  async createRole(dto: CreateRoleDto) {
    const permissions = dto.permissionIds
      ? await this.permissionRepo.findBy({ id: In(dto.permissionIds) })
      : [];

    const role = this.roleRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      permissions: permissions,
    });

    return await this.roleRepo.save(role);
  }

  async getRoles() {
    return await this.roleRepo.find({ relations: ['permissions'] });
  }
}
