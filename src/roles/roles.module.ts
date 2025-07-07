import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

import { Role } from './entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    TenantsModule,
    PermissionsModule
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {} 