// create-service-config.dto.ts
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsObject,
  IsNotEmpty,
  IsUUID,
  IsDateString
} from 'class-validator';

export class CreateServiceConfigDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string; // 'meta', 'aws_s3', 'digital_ocean_spaces', 'vimeo', etc.

  @IsOptional()
  @IsString()
  serviceName?: string; // Nombre amigable

  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, any>; // Datos sensibles

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>; // Configuraciones adicionales

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date; // Para tokens que expiran
}