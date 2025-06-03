// tenant.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TenantService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return await this.tenantService.create(createTenantDto);
  }

  @Get()
  async findAll(): Promise<Tenant[]> {
    return await this.tenantService.findAll();
  }

  @Get('search')
  async findByDomain(@Query('domain') domain: string): Promise<Tenant> {
    return await this.tenantService.findByDomain(domain);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Tenant> {
    return await this.tenantService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Tenant> {
    return await this.tenantService.findBySlug(slug);
  }

  // @Patch(':id')
  // async update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateTenantDto: UpdateTenantDto,
  // ): Promise<Tenant> {
  //   return await this.tenantService.update(id, updateTenantDto);
  // }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.tenantService.remove(id);
  }

  // @Patch(':id/suspend')
  // async suspend(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body('reason') reason?: string,
  // ): Promise<Tenant> {
  //   return await this.tenantService.suspend(id, reason);
  // }

  // @Patch(':id/reactivate')
  // async reactivate(@Param('id', ParseUUIDPipe) id: string): Promise<Tenant> {
  //   return await this.tenantService.reactivate(id);
  // }
}