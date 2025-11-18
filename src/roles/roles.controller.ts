// src/roles/roles.controller.ts
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
  Put
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { ManagePermissionsDto } from './dto/manage-permissions.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles('super-admin')
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query() queryDto: QueryRoleDto) {
    console.log('userrrrrrrrr999', user);
    return this.rolesService.findAll(queryDto);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const role = await this.rolesService.findBySlug(slug);
    if (!role) {
      throw new Error('Rol no encontrado');
    }
    return role;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/active')
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.toggleActive(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Agregar permisos a un rol' })
  @ApiResponse({ status: 200, description: 'Permisos agregados exitosamente' })
  @ApiResponse({ status: 400, description: 'Algunos permisos no existen o ya están asignados' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async addPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManagePermissionsDto
  ) {
    return this.rolesService.addPermissions(id, dto.permissionKeys);
  }

  /**
   * Remover permisos de un rol
   */
  @Delete(':id/permissions')
  @ApiOperation({ summary: 'Remover permisos de un rol' })
  @ApiResponse({ status: 200, description: 'Permisos removidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Permisos no encontrados en el rol' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManagePermissionsDto
  ) {
    return this.rolesService.removePermissions(id, dto.permissionKeys);
  }

  /**
   * Actualizar todos los permisos de un rol (reemplazar)
   */
  @Put(':id/permissions')
  @ApiOperation({ summary: 'Actualizar todos los permisos de un rol' })
  @ApiResponse({ status: 200, description: 'Permisos actualizados exitosamente' })
  @ApiResponse({ status: 400, description: 'Algunos permisos no existen' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManagePermissionsDto
  ) {
    return this.rolesService.updatePermissions(id, dto.permissionKeys);
  }

  /**
   * Obtener permisos de un rol
   */
  @Get(':id/permissions')
  @ApiOperation({ summary: 'Obtener todos los permisos de un rol' })
  @ApiResponse({ status: 200, description: 'Permisos obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.getPermissions(id);
  }

  /**
   * Verificar si un rol tiene un permiso específico
   */
  @Get(':id/permissions/:permissionKey/check')
  @ApiOperation({ summary: 'Verificar si un rol tiene un permiso específico' })
  @ApiResponse({ status: 200, description: 'Verificación completada' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async checkPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionKey') permissionKey: string
  ) {
    const hasPermission = await this.rolesService.hasPermission(id, permissionKey);
    return {
      roleId: id,
      permissionKey,
      hasPermission
    };
  }

  /**
   * Verificar múltiples permisos de un rol
   */
  @Post(':id/permissions/check')
  @ApiOperation({ summary: 'Verificar múltiples permisos de un rol' })
  @ApiResponse({ status: 200, description: 'Verificación completada' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async checkPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManagePermissionsDto
  ) {
    const permissionStatus = await this.rolesService.hasPermissions(id, dto.permissionKeys);
    return {
      roleId: id,
      permissions: permissionStatus
    };
  }
  
}