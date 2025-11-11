import { 
  IsString, 
  IsEmail, 
  IsBoolean, 
  IsOptional, 
  IsUrl,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTenantConfigurationDto } from './create-tenant-configuration.dto';
import { CreateTenantContactDto } from './create-tenant-contact.dto';
import { CreateExternalServiceDto } from './external-service.dto';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones'
  })
  slug: string;

  @IsOptional()
  @IsUrl()
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsUrl()
  favicon?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'Formato de teléfono inválido'
  })
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantConfigurationDto)
  configuration?: CreateTenantConfigurationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTenantContactDto)
  contacts?: CreateTenantContactDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExternalServiceDto)
  externalServices?: CreateExternalServiceDto[];
}