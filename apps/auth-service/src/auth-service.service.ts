import {
  BaseServiceAbstract,
  ROLE_CUSTOMER,
  RegisterDto,
  User,
  comparePassword,
  hashPassword,
} from '@app/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';

//- service xử lý xác thực và tài khoản kế thừa base service abstract
@Injectable()
export class AuthService extends BaseServiceAbstract<User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
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

  //- đăng ký tài khoản mới (mặc định luôn gán vai trò customer)
  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new BadRequestException('Email này đã tồn tại');
    }

    //- băm mật khẩu
    const hashedPassword = await hashPassword(registerDto.password);

    //- luôn gán vai trò mặc định là customer để bảo mật chống leo thang đặc quyền
    const customerRoleCode =
      this.configService.get<string>('DEFAULT_CUSTOMER_ROLE') || ROLE_CUSTOMER;

    let role = await this.roleRepository.findOne({
      where: { code: customerRoleCode },
    });

    if (!role) {
      //- nếu chưa có thì khởi tạo role customer
      role = await this.roleRepository.create({
        code: customerRoleCode,
        name: 'Khách hàng',
        description: 'Người dùng mua sắm và tạo đơn hàng',
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
