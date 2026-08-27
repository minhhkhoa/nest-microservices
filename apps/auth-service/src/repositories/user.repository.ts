import { BaseAbstractRepository, User } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//- repository quản lý các thao tác database cho user kế thừa base abstract repository
@Injectable()
export class UserRepository extends BaseAbstractRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userModel: Repository<User>,
  ) {
    super(userModel);
  }
}
