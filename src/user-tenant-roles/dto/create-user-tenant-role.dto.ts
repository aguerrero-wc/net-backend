import { IsUUID, IsOptional, IsArray, IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateUserTenantRoleDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalPermissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deniedPermissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsUUID()
  assignedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// src/user-tenant-roles/dto/create-user-tenant-role.dto.ts
// export class CreateUserTenantRoleDto {
//   userId: string;        
//   tenantId: string;        
//   roleId: string;
  
//   // Opcionales
//   additionalPermissions?: string[];
//   deniedPermissions?: string[];
//   isActive?: boolean;
//   startsAt?: Date;
//   expiresAt?: Date;
//   assignedBy?: string;
//   notes?: string;
// }