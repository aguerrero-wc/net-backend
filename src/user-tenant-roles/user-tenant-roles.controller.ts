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
import { UserTenantRolesService } from './user-tenant-roles.service';
import { CreateUserTenantRoleDto } from './dto/create-user-tenant-role.dto';
import { UpdateUserTenantRoleDto } from './dto/update-user-tenant-role.dto';
import { QueryUserTenantRoleDto } from './dto/query-user-tenant-role.dto';

@Controller('user-tenant-roles')
export class UserTenantRolesController {
  constructor(private readonly userTenantRolesService: UserTenantRolesService) {}

  @Post()
  async assignRole(@Body() createDto: CreateUserTenantRoleDto) {
    return this.userTenantRolesService.assignRole(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryUserTenantRoleDto) {
    return this.userTenantRolesService.findAll(queryDto);
  }

  @Get('stats')
  async getStats() {
    return this.userTenantRolesService.getStats();
  }

  @Get('user/:userId')
  async getUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userTenantRolesService.getUserRoles(userId);
  }

  @Get('tenant/:tenantId')
  async getTenantUsers(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.userTenantRolesService.getTenantUsers(tenantId);
  }

  @Get('user/:userId/tenant/:tenantId')
  async getUserRoleInTenant(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('tenantId', ParseUUIDPipe) tenantId: string
  ) {
    return this.userTenantRolesService.getUserRoleInTenant(userId, tenantId);
  }

  @Get('user/:userId/tenant/:tenantId/permissions')
  async getUserPermissions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('tenantId', ParseUUIDPipe) tenantId: string
  ) {
    const permissions = await this.userTenantRolesService.getUserEffectivePermissions(userId, tenantId);
    return { permissions };
  }

  @Get('user/:userId/tenant/:tenantId/has-permission/:permission')
  async checkPermission(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('permission') permission: string
  ) {
    const hasPermission = await this.userTenantRolesService.userHasPermission(userId, tenantId, permission);
    return { hasPermission };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateUserTenantRoleDto
  ) {
    return this.userTenantRolesService.update(id, updateDto);
  }

  @Patch(':id/revoke')
  async revokeRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.userTenantRolesService.revokeRole(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.userTenantRolesService.remove(id);
  }
}