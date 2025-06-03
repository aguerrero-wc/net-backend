import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TenantService } from '../tenants/tenants.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private tenantsService: TenantService,
  ) {}

  // async create(createRoleDto: CreateRoleDto): Promise<Role> {
  //   // Verificar que el tenant existe
  //   await this.tenantsService.findOne(createRoleDto.tenantId);
    
  //   const role = this.rolesRepository.create(createRoleDto);
  //   return this.rolesRepository.save(role);
  // }

  // async findAll(tenantId: string): Promise<Role[]> {
  //   return this.rolesRepository.find({
  //     where: { tenantId },
  //     relations: ['tenant'],
  //   });
  // }

  // async findOne(id: string, tenantId: string): Promise<Role> {
  //   const role = await this.rolesRepository.findOne({
  //     where: { id, tenantId },
  //     relations: ['tenant'],
  //   });

  //   if (!role) {
  //     throw new NotFoundException(`Role with ID "${id}" not found in tenant "${tenantId}"`);
  //   }

  //   return role;
  // }

  // async update(id: string, tenantId: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
  //   const role = await this.findOne(id, tenantId);
  //   Object.assign(role, updateRoleDto);
  //   return this.rolesRepository.save(role);
  // }

  // async remove(id: string, tenantId: string): Promise<void> {
  //   const result = await this.rolesRepository.delete({ id, tenantId });
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Role with ID "${id}" not found in tenant "${tenantId}"`);
  //   }
  // }
} 