import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // @Post()
  // create(@Body() createRoleDto: CreateRoleDto) {
  //   return this.rolesService.create(createRoleDto);
  // }

  // @Get()
  // findAll(@Query('tenantId') tenantId: string) {
  //   return this.rolesService.findAll(tenantId);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
  //   return this.rolesService.findOne(id, tenantId);
  // }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Query('tenantId') tenantId: string,
  //   @Body() updateRoleDto: UpdateRoleDto,
  // ) {
  //   return this.rolesService.update(id, tenantId, updateRoleDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
  //   return this.rolesService.remove(id, tenantId);
  // }
} 