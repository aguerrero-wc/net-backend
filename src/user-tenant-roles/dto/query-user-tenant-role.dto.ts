import { 
  IsOptional, 
  IsUUID, 
  IsBoolean, 
  IsNumber, 
  IsDateString,
  Min, 
  Max 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryUserTenantRoleDto {
  // === FILTROS POR RELACIONES ===
  
  @IsOptional()
  @IsUUID(4, { message: 'userId debe ser un UUID válido' })
  userId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'tenantId debe ser un UUID válido' })
  tenantId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'roleId debe ser un UUID válido' })
  roleId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'assignedBy debe ser un UUID válido' })
  assignedBy?: string;

  // === FILTROS DE ESTADO ===
  
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'includeExpired debe ser true o false' })
  includeExpired?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'includeNotStarted debe ser true o false' })
  includeNotStarted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'onlyCurrentlyActive debe ser true o false' })
  onlyCurrentlyActive?: boolean;

  // === FILTROS DE FECHA ===
  
  @IsOptional()
  @IsDateString({}, { message: 'createdAfter debe ser una fecha válida (ISO)' })
  createdAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'createdBefore debe ser una fecha válida (ISO)' })
  createdBefore?: string;

  @IsOptional()
  @IsDateString({}, { message: 'expiresAfter debe ser una fecha válida (ISO)' })
  expiresAfter?: string;

  @IsOptional()
  @IsDateString({}, { message: 'expiresBefore debe ser una fecha válida (ISO)' })
  expiresBefore?: string;

  // === FILTROS DE BÚSQUEDA ===
  
  @IsOptional()
  search?: string; // Búsqueda en notas o nombres de usuario/tenant/rol

  // === FILTROS DE PERMISOS ===
  
  @IsOptional()
  hasPermission?: string; // Filtrar por usuarios que tengan un permiso específico

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasAdditionalPermissions?: boolean; // Filtrar roles con permisos adicionales

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasDeniedPermissions?: boolean; // Filtrar roles con permisos denegados

  // === PAGINACIÓN Y ORDENAMIENTO ===
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsNumber({}, { message: 'page debe ser un número' })
  @Min(1, { message: 'page debe ser mayor a 0' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsNumber({}, { message: 'limit debe ser un número' })
  @Min(1, { message: 'limit debe ser mayor a 0' })
  @Max(100, { message: 'limit no puede ser mayor a 100' })
  limit?: number = 10;

  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'startsAt' | 'expiresAt' | 'userName' | 'tenantName' | 'roleName' = 'createdAt';

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  // === OPCIONES DE CARGA ===
  
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeUser?: boolean = true; // Incluir datos del usuario

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeTenant?: boolean = true; // Incluir datos del tenant

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeRole?: boolean = true; // Incluir datos del rol
}