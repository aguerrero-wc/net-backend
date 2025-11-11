import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { TenantContact } from './entities/tenant-contact.entity';
import { TenantExternalService } from './entities/external-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantConfiguration, TenantContact, TenantExternalService])],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}