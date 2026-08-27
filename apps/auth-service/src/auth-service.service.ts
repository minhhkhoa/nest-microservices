import {
  BaseServiceAbstract,
  RegisterDto,
  User,
  comparePassword,
  hashPassword,
} from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';

//- service xử lý xác thực và tài khoản kế thừa base service abstract
@Injectable()
export class AuthService extends BaseServiceAbstract<User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {
    super(userRepository);
  }

  //- kiểm tra email và mật khẩu khi đăng nhập
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) return null;

    //- so sánh mật khẩu mã hóa bcrypt
    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) return null;

    //- loại bỏ password trước khi trả về
    const { password: _password, ...result } = user;
    return result;
  }

  //- đăng ký tài khoản mới
  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new BadRequestException('Email này đã tồn tại');
    }

    //- băm mật khẩu
    const hashedPassword = await hashPassword(registerDto.password);

    //- tìm role mặc định nếu không truyền lên
    const roleCode = registerDto.roleCode || 'CUSTOMER';
    let role = await this.roleRepository.findOne({ where: { code: roleCode } });
    if (!role) {
      //- nếu chưa có thì tự khởi tạo role
      role = await this.roleRepository.create({
        code: roleCode,
        name: roleCode,
        description: '',
        permissions: [],
      });
    }

    const saved = await this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: role,
    });

    const { password: _password, ...result } = saved;
    return result;
  }

  //- lấy thông tin user kèm đầy đủ role và permissions (dùng cho jwt strategy)
  async getUserWithPermissions(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });
  }
}
