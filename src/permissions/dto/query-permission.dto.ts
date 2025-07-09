import { IsOptional, IsString, IsPositive, Min, Max, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPermissionDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  key?: string;

  // Paginación
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;
  
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  getAllPermissions?: boolean = false;
}
