import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { TenantsModule } from './tenants/tenants.module';
import { UserTenantRolesModule } from './user-tenant-roles/user-tenant-roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig, // 👈 Usa la función factory
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    TenantsModule,
    UserTenantRolesModule,
  ],
})
export class AppModule {}
