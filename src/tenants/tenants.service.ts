import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { ContactType, TenantContact } from './entities/tenant-contact.entity';
import { TenantExternalService } from './entities/external-service.entity';
import { CommonService } from '../common/common.service';

import { CreateTenantContactDto } from './dto/create-tenant-contact.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    
    @InjectRepository(TenantConfiguration)
    private readonly configRepository: Repository<TenantConfiguration>,
    
    @InjectRepository(TenantContact)
    private readonly contactRepository: Repository<TenantContact>,

    @InjectRepository(TenantExternalService)
    private readonly externalServiceRepository: Repository<TenantExternalService>,

    private readonly commonService: CommonService,
  ) {}

  /**
   * Crear un nuevo tenant con su configuración
   */
async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // ========== VALIDACIONES ==========
    
    // Verificar que no exista un tenant con el mismo slug o nombre
    const existingTenant = await this.tenantRepository.findOne({
      where: [
        { slug: createTenantDto.slug },
        { name: createTenantDto.name }
      ]
    });

    if (existingTenant) {
      if (existingTenant.slug === createTenantDto.slug) {
        throw new ConflictException('Ya existe un tenant con ese slug');
      }
      if (existingTenant.name === createTenantDto.name) {
        throw new ConflictException('Ya existe un tenant con ese nombre');
      }
    }

    // Verificar dominio si se proporciona
    if (createTenantDto.domain) {
      const existingDomain = await this.tenantRepository.findOne({
        where: { domain: createTenantDto.domain }
      });
      if (existingDomain) {
        throw new ConflictException('Ya existe un tenant con ese dominio');
      }
    }

    // ========== CREAR TENANT ==========
    
    const tenant = this.tenantRepository.create({
      name: createTenantDto.name,
      slug: createTenantDto.slug,
      domain: createTenantDto.domain,
      description: createTenantDto.description,
      logo: createTenantDto.logo,
      favicon: createTenantDto.favicon,
      contactEmail: createTenantDto.contactEmail,
      contactPhone: createTenantDto.contactPhone,
      isActive: createTenantDto.isActive ?? true,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // ========== CREAR CONFIGURACIÓN ==========
    
    const config = this.configRepository.create({
      tenant: savedTenant,
      tenantId: savedTenant.id,
      ...createTenantDto.configuration,
      // Valores por defecto si no se proporcionan
      primaryColor: createTenantDto.configuration?.primaryColor || '#E6600D',
      secondaryColor: createTenantDto.configuration?.secondaryColor || '#FF7A2F',
      accentColor: createTenantDto.configuration?.accentColor || '#10B981',
      theme: createTenantDto.configuration?.theme || 'light',
      uiStyle: createTenantDto.configuration?.uiStyle || 'modern',
    });

    await this.configRepository.save(config);

    // ========== CREAR CONTACTOS ==========
    
    if (createTenantDto.contacts && createTenantDto.contacts.length > 0) {
      const tenantContacts = createTenantDto.contacts.map(contactDto => 
        this.contactRepository.create({
          ...contactDto,
          tenantId: savedTenant.id,
        })
      );
      
      await this.contactRepository.save(tenantContacts);
    }

    // ========== CREAR SERVICIOS EXTERNOS CON ENCRIPTACIÓN ==========
    
    if (createTenantDto.externalServices && createTenantDto.externalServices.length > 0) {
      for (const serviceDto of createTenantDto.externalServices) {
        // Encriptar las credenciales antes de guardar
        const encryptedCredentials = this.commonService.encryptObject(
          serviceDto.credentials
        );

        const service = this.externalServiceRepository.create({
          serviceType: serviceDto.serviceType,
          credentials: encryptedCredentials,
          isActive: serviceDto.isActive ?? true,
          tenant: savedTenant,
        });

        await this.externalServiceRepository.save(service);
      }
    }

    // ========== RETORNAR TENANT COMPLETO ==========
    
    return this.findOne(savedTenant.id);
  }

  /**
   * Obtener todos los tenants con paginación y filtros
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: Tenant[]; total: number; page: number; limit: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.configuration', 'configuration')
      .orderBy('tenant.createdAt', 'DESC');

    // Filtro de búsqueda
    if (options?.search) {
      queryBuilder.where(
        '(tenant.name ILIKE :search OR tenant.slug ILIKE :search OR tenant.description ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    // Filtro de estado activo
    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('tenant.isActive = :isActive', { isActive: options.isActive });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener un tenant por ID
   */
 async findOne(id: string, includeCredentials = false): Promise<Tenant> {
  const tenant = await this.tenantRepository.findOne({
    where: { id },
    relations: ['configuration', 'contacts', 'externalServices'],
  });

  if (!tenant) {
    throw new NotFoundException(`Tenant con ID ${id} no encontrado`);
  }

  // ⚠️ Solo desencriptar si se solicita explícitamente (uso interno)
  if (includeCredentials && tenant.externalServices) {
    tenant.externalServices = tenant.externalServices.map(service => ({
      ...service,
      credentials: this.commonService.decryptObject(service.credentials),
    }));
  }

  return tenant;
}

  /**
   * Obtener un tenant por slug
   */
  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
      relations: ['configuration'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con slug ${slug} no encontrado`);
    }

    return tenant;
  }

  /**
   * Obtener un tenant por dominio
   */
  async findByDomain(domain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { domain },
      relations: ['configuration'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con dominio ${domain} no encontrado`);
    }

    return tenant;
  }

  /**
   * Actualizar un tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Verificar slug único si se está actualizando
    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existingSlug = await this.tenantRepository.findOne({
        where: { slug: updateTenantDto.slug }
      });
      if (existingSlug) {
        throw new ConflictException('Ya existe un tenant con ese slug');
      }
    }

    // Verificar nombre único si se está actualizando
    if (updateTenantDto.name && updateTenantDto.name !== tenant.name) {
      const existingName = await this.tenantRepository.findOne({
        where: { name: updateTenantDto.name }
      });
      if (existingName) {
        throw new ConflictException('Ya existe un tenant con ese nombre');
      }
    }

    // Verificar dominio único si se está actualizando
    if (updateTenantDto.domain && updateTenantDto.domain !== tenant.domain) {
      const existingDomain = await this.tenantRepository.findOne({
        where: { domain: updateTenantDto.domain }
      });
      if (existingDomain) {
        throw new ConflictException('Ya existe un tenant con ese dominio');
      }
    }

    // Actualizar datos del tenant
    Object.assign(tenant, {
      name: updateTenantDto.name ?? tenant.name,
      slug: updateTenantDto.slug ?? tenant.slug,
      domain: updateTenantDto.domain ?? tenant.domain,
      description: updateTenantDto.description ?? tenant.description,
      logo: updateTenantDto.logo ?? tenant.logo,
      favicon: updateTenantDto.favicon ?? tenant.favicon,
      contactEmail: updateTenantDto.contactEmail ?? tenant.contactEmail,
      contactPhone: updateTenantDto.contactPhone ?? tenant.contactPhone,
      isActive: updateTenantDto.isActive ?? tenant.isActive,
    });

    await this.tenantRepository.save(tenant);

    // Actualizar configuración si se proporciona
    if (updateTenantDto.configuration) {
      const config = await this.configRepository.findOne({
        where: { tenantId: id }
      });

      if (config) {
        Object.assign(config, updateTenantDto.configuration);
        await this.configRepository.save(config);
      }
    }

    return this.findOne(id);
  }

  /**
   * Activar/Desactivar un tenant
   */
  async toggleActive(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.isActive = !tenant.isActive;
    await this.tenantRepository.save(tenant);
    return this.findOne(id);
  }

  /**
   * Eliminar un tenant (soft delete - cambiar isActive a false)
   */
  async remove(id: string): Promise<{ message: string }> {
    const tenant = await this.findOne(id);
    
    // Soft delete - solo desactivar
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);

    return { message: `Tenant ${tenant.name} desactivado correctamente` };
  }

  /**
   * Eliminar permanentemente un tenant
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const tenant = await this.findOne(id);
    
    await this.tenantRepository.remove(tenant);

    return { message: `Tenant eliminado permanentemente` };
  }

  /**
   * Obtener estadísticas de tenants
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withDomain: number;
  }> {
    const total = await this.tenantRepository.count();
    const active = await this.tenantRepository.count({ where: { isActive: true } });
    const inactive = await this.tenantRepository.count({ where: { isActive: false } });
    const withDomain = await this.tenantRepository
      .createQueryBuilder('tenant')
      .where('tenant.domain IS NOT NULL')
      .getCount();

    return {
      total,
      active,
      inactive,
      withDomain,
    };
  }

  // Crear contacto para un tenant
  async createContact(tenantId: string, dto: CreateTenantContactDto) {
    const tenant = await this.tenantRepository.findOne({ 
      where: { id: tenantId } 
    });
    
    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const contact = this.contactRepository.create({
      ...dto,
      tenantId,
    });

    return this.contactRepository.save(contact);
  }

  // Obtener todos los contactos de un tenant
  async getContactsByTenant(tenantId: string, type?: ContactType) {
    const where: any = { tenantId, isActive: true };
    if (type) {
      where.type = type;
    }

    return this.contactRepository.find({
      where,
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  // Obtener tenant con sus contactos
  async findOneWithContacts(id: string) {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });
  }

  // Actualizar contacto
  async updateContact(contactId: string, dto: Partial<CreateTenantContactDto>) {
    const contact = await this.contactRepository.findOne({ 
      where: { id: contactId } 
    });
    
    if (!contact) {
      throw new NotFoundException(`Contact ${contactId} not found`);
    }

    Object.assign(contact, dto);
    return this.contactRepository.save(contact);
  }

  // Eliminar contacto (soft delete)
  async deleteContact(contactId: string) {
    return this.contactRepository.update(contactId, { isActive: false });
  }

}