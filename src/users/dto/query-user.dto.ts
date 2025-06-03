import { IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre, apellido o email',
    example: 'juan'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por email específico',
    example: 'juan.perez@example.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por estado bloqueado',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isBlocked?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por email verificado',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por 2FA habilitado',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Página actual',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}