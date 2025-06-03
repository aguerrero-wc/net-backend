import { Module } from '@nestjs/common';
import { UserTenantRolesService } from './user-tenant-roles.service';
import { UserTenantRolesController } from './user-tenant-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTenantRole } from './entities/user-tenant-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTenantRole])],
  providers: [UserTenantRolesService],
  controllers: [UserTenantRolesController]
})
export class UserTenantRolesModule {}
