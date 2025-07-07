import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

// src/permissions/dto/query-permission.dto.ts
import { IsOptional, IsString, IsPositive, Min, Max } from 'class-validator';
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
}