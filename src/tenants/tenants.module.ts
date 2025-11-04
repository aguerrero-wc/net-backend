import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from './entities/tenant-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantConfiguration])],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {} 