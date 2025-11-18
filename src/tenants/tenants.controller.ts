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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  private sanitizeTenantResponse(tenant: any) {
    const { externalServices, ...tenantData } = tenant;

    if (!externalServices || externalServices.length === 0) {
      return {
        ...tenantData,
        externalServices: [],
      };
    }

    // Campos que SÍ se pueden mostrar (no sensibles)
    const nonSensitiveFields = [
      'bucket',
      'region',
      'fromEmail',
      'fromName',
      'endpoint',
      'appId',      // App ID no es secreto
      'clientId',   // Client ID no es secreto
      'publicKey',  // Public key no es secreto (Stripe)
    ];

    const sanitizedServices = externalServices.map(service => {
      const { credentials, ...serviceData } = service;
      
      const maskedCredentials = {};
      if (credentials) {
        for (const [key, value] of Object.entries(credentials)) {
          // Si el campo NO es sensible, mostrarlo completo
          if (nonSensitiveFields.includes(key)) {
            maskedCredentials[key] = value;
          } else {
            // Si es sensible, enmascarar
            maskedCredentials[key] = '••••••••';
          }
        }
      }

      return {
        ...serviceData,
        credentials: maskedCredentials,
        hasCredentials: credentials && Object.keys(credentials).length > 0,
      };
    });

    return {
      ...tenantData,
      externalServices: sanitizedServices,
    };
  }

  /**
   * POST /tenants
   * Crear un nuevo tenant
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.create(createTenantDto);
    console.log(tenant);
    return this.sanitizeTenantResponse(tenant);
  }

  /**
   * GET /tenants
   * Obtener todos los tenants con paginación y filtros
   */
  @Get()
  @Roles('editor')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.tenantsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  /**
   * GET /tenants/stats
   * Obtener estadísticas de tenants
   */
  @Get('stats')
  getStats() {
    return this.tenantsService.getStats();
  }

  /**
   * GET /tenants/slug/:slug
   * Obtener un tenant por slug
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  /**
   * GET /tenants/domain/:domain
   * Obtener un tenant por dominio
   */
  @Get('domain/:domain')
  findByDomain(@Param('domain') domain: string) {
    return this.tenantsService.findByDomain(domain);
  }

  /**
   * GET /tenants/:id
   * Obtener un tenant por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const tenant = await this.tenantsService.findOne(id);
    return this.sanitizeTenantResponse(tenant);
  }

  /**
   * PATCH /tenants/:id
   * Actualizar un tenant
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  /**
   * PATCH /tenants/:id/toggle-active
   * Activar/Desactivar un tenant
   */
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.toggleActive(id);
  }

  /**
   * DELETE /tenants/:id
   * Desactivar un tenant (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.remove(id);
  }

  /**
   * DELETE /tenants/:id/hard
   * Eliminar permanentemente un tenant
   */
  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.hardDelete(id);
  }
}