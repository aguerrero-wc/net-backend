import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsBoolean, 
  IsNumber, 
  IsDateString,
  IsObject,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  IsIn
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.toLowerCase())
  slug: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['free', 'basic', 'premium', 'enterprise'])
  plan?: string = 'free';

  @IsOptional()
  @IsDateString()
  planExpiresAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsers?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(100)
  maxStorage?: number = 1000;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean = false;

  @IsOptional()
  @IsString()
  suspendedReason?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

