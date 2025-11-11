// src/tenants/dto/external-service.dto.ts
import { IsString, IsEnum, IsBoolean, IsOptional, ValidateNested, IsNotEmpty, IsObject } from 'class-validator';
import { Type } from 'class-transformer';


export enum ServiceType {
  AWS_S3 = 'AWS S3',
  DIGITAL_OCEAN_SPACES = 'Digital Ocean Spaces',
  SMTP2GO = 'SMTP2GO',
  SENDGRID = 'SendGrid',
  META = 'Meta (Facebook/Instagram)',
  STRIPE = 'Stripe',
  VIMEO = 'Vimeo',
  YOUTUBE_API = 'YouTube API'       
}

// DTO base para credenciales
export class ServiceCredentialsDto {
  @IsOptional()
  @IsObject()
  credentials: Record<string, any>; // Aquí irán las credenciales específicas
}

// DTOs específicos por servicio (validación fuerte)
export class AwsS3CredentialsDto {
  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;

  @IsString()
  @IsNotEmpty()
  region: string;
}

export class DigitalOceanSpacesCredentialsDto {
  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;
}

// ... otros servicios

// DTO principal para external service
export class CreateExternalServiceDto {
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, any>; // Validación dinámica según serviceType
}