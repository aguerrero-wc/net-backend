import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenants.service';
import { TenantController } from './tenants.controller';

import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from './entities/tenant-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantConfiguration])],
  providers: [TenantService],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantsModule {} 