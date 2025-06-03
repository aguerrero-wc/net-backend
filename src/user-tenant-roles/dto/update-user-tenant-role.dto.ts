import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTenantRoleDto } from './create-user-tenant-role.dto';

export class UpdateUserTenantRoleDto extends PartialType(CreateUserTenantRoleDto) {}

// src/user-tenant-roles/dto/query-user-tenant-role.dto.ts
import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserTenantRoleDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeExpired?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}