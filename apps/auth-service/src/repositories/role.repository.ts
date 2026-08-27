import { BaseAbstractRepository, Role } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//- repository quản lý các thao tác database cho role kế thừa base abstract repository
@Injectable()
export class RoleRepository extends BaseAbstractRepository<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleModel: Repository<Role>,
  ) {
    super(roleModel);
  }
}
