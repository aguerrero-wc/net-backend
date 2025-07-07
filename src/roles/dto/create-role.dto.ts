import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, MinLength, MaxLength, Min, Max, IsNotEmpty } from 'class-validator';


export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionKeys?: string[]; // Nuevo campo para los keys de permisos
}