import { BaseAbstractRepository, Permission } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//- repository quản lý các thao tác database cho permission kế thừa base abstract repository
@Injectable()
export class PermissionRepository extends BaseAbstractRepository<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionModel: Repository<Permission>,
  ) {
    super(permissionModel);
  }
}
