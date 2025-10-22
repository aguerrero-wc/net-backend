import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards
} from '@nestjs/common';
import { TenantService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';


@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return await this.tenantService.create(createTenantDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<Tenant[]> {
    return await this.tenantService.findAll();
  }

  @Get('search')
  async findByDomain(@Query('domain') domain: string): Promise<Tenant> {
    return await this.tenantService.findByDomain(domain);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User): Promise<Tenant> {
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