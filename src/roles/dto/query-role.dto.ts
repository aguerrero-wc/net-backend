import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class QueryRoleDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isSystemRole?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  minLevel?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includePermissions?: boolean; // Nuevo campo
}