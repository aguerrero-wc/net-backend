// tenant.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Verificar si ya existe un tenant con el mismo name, slug o domain
    const existingTenant = await this.tenantRepository.findOne({
      where: [
        { name: createTenantDto.name },
        { slug: createTenantDto.slug },
        { domain: createTenantDto.domain },
      ],
    });

    if (existingTenant) {
      if (existingTenant.name === createTenantDto.name) {
        throw new ConflictException('Ya existe un tenant con ese nombre');
      }
      if (existingTenant.slug === createTenantDto.slug) {
        throw new ConflictException('Ya existe un tenant con ese slug');
      }
      if (existingTenant.domain === createTenantDto.domain) {
        throw new ConflictException('Ya existe un tenant con ese dominio');
      }
    }

    // Verificar customDomain si se proporciona
    if (createTenantDto.customDomain) {
      const existingCustomDomain = await this.tenantRepository.findOne({
        where: { customDomain: createTenantDto.customDomain },
      });
      
      if (existingCustomDomain) {
        throw new ConflictException('Ya existe un tenant con ese dominio personalizado');
      }
    }

    try {
      const tenant = this.tenantRepository.create(createTenantDto);
      return await this.tenantRepository.save(tenant);
    } catch (error) {
      throw new BadRequestException('Error al crear el tenant');
    }
  }

  async findAll(): Promise<Tenant[]> {
    return await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['userRoles', 'configuration'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${id} no encontrado`);
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
      relations: ['userRoles', 'configuration'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con slug ${slug} no encontrado`);
    }

    return tenant;
  }

  async findByDomain(domain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: [
        { domain },
        { customDomain: domain },
      ],
      relations: ['userRoles', 'configuration'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con dominio ${domain} no encontrado`);
    }

    return tenant;
  }

  // async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
  //   const tenant = await this.findById(id);

  //   // Verificar conflictos solo si se están actualizando campos únicos
  //   if (updateTenantDto.name || updateTenantDto.slug || updateTenantDto.domain || updateTenantDto.customDomain) {
  //     const conflicts = [];
      
  //     if (updateTenantDto.name) conflicts.push({ name: updateTenantDto.name });
  //     if (updateTenantDto.slug) conflicts.push({ slug: updateTenantDto.slug });
  //     if (updateTenantDto.domain) conflicts.push({ domain: updateTenantDto.domain });
  //     if (updateTenantDto.customDomain) conflicts.push({ customDomain: updateTenantDto.customDomain });

  //     if (conflicts.length > 0) {
  //       const existingTenant = await this.tenantRepository.findOne({
  //         where: conflicts,
  //       });

  //       if (existingTenant && existingTenant.id !== id) {
  //         throw new ConflictException('Ya existe un tenant con alguno de los valores únicos proporcionados');
  //       }
  //     }
  //   }

  //   try {
  //     await this.tenantRepository.update(id, updateTenantDto);
  //     return await this.findById(id);
  //   } catch (error) {
  //     throw new BadRequestException('Error al actualizar el tenant');
  //   }
  // }

  async remove(id: string): Promise<void> {
    const tenant = await this.findById(id);
    
    try {
      await this.tenantRepository.remove(tenant);
    } catch (error) {
      throw new BadRequestException('Error al eliminar el tenant');
    }
  }

  // async suspend(id: string, reason?: string): Promise<Tenant> {
  //   return await this.update(id, {
  //     isSuspended: true,
  //     suspendedReason: reason || 'Suspendido por el administrador',
  //     isActive: false,
  //   });
  // }

  // async reactivate(id: string): Promise<Tenant> {
  //   return await this.update(id, {
  //     isSuspended: false,
  //     suspendedReason: null,
  //     isActive: true,
  //   });
  // }
}