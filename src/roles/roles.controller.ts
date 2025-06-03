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
  ParseUUIDPipe
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { ManagePermissionsDto } from './dto/manage-permissions.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Post('setup-defaults')
  @HttpCode(HttpStatus.OK)
  async setupDefaultRoles() {
    await this.rolesService.createDefaultRoles();
    return { message: 'Roles por defecto creados exitosamente' };
  }

  @Get()
  async findAll(@Query() queryDto: QueryRoleDto) {
    return this.rolesService.findAll(queryDto);
  }

  @Get('stats')
  async getStats() {
    return this.rolesService.getStats();
  }

  @Get('by-level/:minLevel')
  async findByMinLevel(@Param('minLevel') minLevel: string) {
    return this.rolesService.findByMinLevel(parseInt(minLevel));
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

  @Get(':id/has-permission/:permission')
  async hasPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permission') permission: string
  ) {
    const hasPermission = await this.rolesService.hasPermission(id, permission);
    return { hasPermission };
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

  @Patch(':id/permissions/add')
  async addPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() managePermissionsDto: ManagePermissionsDto
  ) {
    return this.rolesService.addPermissions(id, managePermissionsDto.permissions);
  }

  @Patch(':id/permissions/remove')
  async removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() managePermissionsDto: ManagePermissionsDto
  ) {
    return this.rolesService.removePermissions(id, managePermissionsDto.permissions);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.rolesService.remove(id);
  }
}