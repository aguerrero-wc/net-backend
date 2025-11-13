import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { CreateBulkPermissionsDto } from './dto/create-bulk-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Crear un nuevo permiso
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El permiso ya existe' })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  /**
   * Crear múltiples permisos
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Crear múltiples permisos de una vez' })
  @ApiResponse({ status: 201, description: 'Permisos creados exitosamente' })
  @ApiResponse({ status: 409, description: 'Uno o más permisos ya existen' })
  async createBulk(@Body() createBulkDto: CreateBulkPermissionsDto) {
    return this.permissionsService.createBulk(createBulkDto);
  }

  /**
   * Crear permisos por defecto del sistema
   */
  @Post('defaults')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear permisos por defecto del sistema' })
  @ApiResponse({ status: 200, description: 'Permisos por defecto creados exitosamente' })
  async createDefaults() {
    await this.permissionsService.createDefaultPermissions();
    return { message: 'Permisos por defecto creados exitosamente' };
  }

  /**
   * Obtener todos los permisos con filtros y paginación
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los permisos con filtros' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por key, descripción o grupo' })
  @ApiQuery({ name: 'group', required: false, description: 'Filtrar por grupo' })
  @ApiQuery({ name: 'key', required: false, description: 'Filtrar por key' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  async findAll(@Query() queryDto: QueryPermissionDto) {
    return this.permissionsService.findAll(queryDto);
  }

  /**
   * Obtener todos los permisos agrupados
   */
  @Get('grouped')
  @ApiOperation({ summary: 'Obtener todos los permisos agrupados por categoría' })
  @ApiResponse({ status: 200, description: 'Permisos agrupados obtenidos exitosamente' })
  async findAllGrouped() {
    return this.permissionsService.findAllGrouped();
  }

  /**
   * Obtener todos los grupos únicos
   */
  @Get('groups')
  @ApiOperation({ summary: 'Obtener todos los grupos de permisos únicos' })
  @ApiResponse({ status: 200, description: 'Grupos obtenidos exitosamente' })
  async getGroups() {
    return this.permissionsService.getGroups();
  }

  /**
   * Obtener estadísticas de permisos
   */
  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de permisos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getStats() {
    return this.permissionsService.getStats();
  }

  /**
   * Obtener permisos por grupo
   */
  @Get('group/:group')
  @ApiOperation({ summary: 'Obtener permisos por grupo específico' })
  @ApiResponse({ status: 200, description: 'Permisos del grupo obtenidos exitosamente' })
  async findByGroup(@Param('group') group: string) {
    return this.permissionsService.findByGroup(group);
  }

  /**
   * Obtener un permiso por key
   */
  @Get('key/:key')
  @ApiOperation({ summary: 'Obtener un permiso por su key' })
  @ApiResponse({ status: 200, description: 'Permiso encontrado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  async findByKey(@Param('key') key: string) {
    const permission = await this.permissionsService.findByKey(key);
    if (!permission) {
      return { message: 'Permiso no encontrado' };
    }
    return permission;
  }

  /**
   * Obtener un permiso por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiResponse({ status: 200, description: 'Permiso encontrado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  /**
   * Actualizar un permiso
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un permiso' })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto: key ya existe' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  /**
   * Eliminar un permiso
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un permiso' })
  @ApiResponse({ status: 204, description: 'Permiso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.permissionsService.remove(id);
  }

  /**
   * Eliminar múltiples permisos
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar múltiples permisos' })
  @ApiResponse({ status: 204, description: 'Permisos eliminados exitosamente' })
  @ApiResponse({ status: 400, description: 'IDs inválidos proporcionados' })
  async removeBulk(@Body('ids') ids: string[]) {
    await this.permissionsService.removeBulk(ids);
  }
}