// src/tenants/dto/create-tenant-contact.dto.ts
import { IsEnum, IsString, IsEmail, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ContactType } from '../entities/tenant-contact.entity';

export class CreateTenantContactDto {
  @IsEnum(ContactType)
  type: ContactType;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}