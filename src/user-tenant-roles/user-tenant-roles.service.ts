import { Injectable } from '@nestjs/common';

import { ConflictException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTenantRole } from './entities/user-tenant-role.entity';
import { CreateUserTenantRoleDto } from './dto/create-user-tenant-role.dto';
import { UpdateUserTenantRoleDto } from './dto/update-user-tenant-role.dto';
import { QueryUserTenantRoleDto } from './dto/query-user-tenant-role.dto';

@Injectable()
export class UserTenantRolesService {
  constructor(
    @InjectRepository(UserTenantRole)
    private readonly userTenantRoleRepository: Repository<UserTenantRole>,
  ) {}

  /**
   * Asignar un rol a un usuario en un tenant
   */
  async assignRole(createDto: CreateUserTenantRoleDto): Promise<UserTenantRole> {
    // Verificar si ya existe una asignación activa
    const existingAssignment = await this.userTenantRoleRepository.findOne({
      where: {
        userId: createDto.userId,
        tenantId: createDto.tenantId,
        isActive: true
      }
    });

    if (existingAssignment) {
      throw new ConflictException(
        'El usuario ya tiene un rol asignado en este tenant. Use update para modificarlo.'
      );
    }

    // Crear la asignación
    const assignment = this.userTenantRoleRepository.create(createDto);

    try {
      return await this.userTenantRoleRepository.save(assignment);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ConflictException('Ya existe una asignación para este usuario y tenant');
      }
      throw error;
    }
  }

  /**
   * Obtener todas las asignaciones con filtros
   */
  async findAll(queryDto: QueryUserTenantRoleDto) {
    const { 
      userId, 
      tenantId, 
      roleId, 
      isActive, 
      includeExpired = false,
      page = 1, 
      limit = 10 
    } = queryDto;

    const queryBuilder = this.userTenantRoleRepository
      .createQueryBuilder('utr')
      .leftJoinAndSelect('utr.user', 'user')
      .leftJoinAndSelect('utr.tenant', 'tenant')
      .leftJoinAndSelect('utr.role', 'role');

    // Filtros
    if (userId) {
      queryBuilder.andWhere('utr.userId = :userId', { userId });
    }

    if (tenantId) {
      queryBuilder.andWhere('utr.tenantId = :tenantId', { tenantId });
    }

    if (roleId) {
      queryBuilder.andWhere('utr.roleId = :roleId', { roleId });
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('utr.isActive = :isActive', { isActive });
    }

    // Filtrar expirados si no se incluyen explícitamente
    if (!includeExpired) {
      queryBuilder.andWhere(
        '(utr.expiresAt IS NULL OR utr.expiresAt > :now)',
        { now: new Date() }
      );
    }

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento
    queryBuilder.orderBy('utr.createdAt', 'DESC');

    const [assignments, total] = await queryBuilder.getManyAndCount();

    return {
      data: assignments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener roles de un usuario específico
   */
  async getUserRoles(userId: string, includeInactive = false): Promise<UserTenantRole[]> {
    const queryBuilder = this.userTenantRoleRepository
      .createQueryBuilder('utr')
      .leftJoinAndSelect('utr.tenant', 'tenant')
      .leftJoinAndSelect('utr.role', 'role')
      .where('utr.userId = :userId', { userId });

    if (!includeInactive) {
      queryBuilder
        .andWhere('utr.isActive = true')
        .andWhere('(utr.expiresAt IS NULL OR utr.expiresAt > :now)', { now: new Date() })
        .andWhere('(utr.startsAt IS NULL OR utr.startsAt <= :now)', { now: new Date() });
    }

    return queryBuilder.getMany();
  }

  /**
   * Obtener usuarios de un tenant específico
   */
  async getTenantUsers(tenantId: string, includeInactive = false): Promise<UserTenantRole[]> {
    const queryBuilder = this.userTenantRoleRepository
      .createQueryBuilder('utr')
      .leftJoinAndSelect('utr.user', 'user')
      .leftJoinAndSelect('utr.role', 'role')
      .where('utr.tenantId = :tenantId', { tenantId });

    if (!includeInactive) {
      queryBuilder
        .andWhere('utr.isActive = true')
        .andWhere('(utr.expiresAt IS NULL OR utr.expiresAt > :now)', { now: new Date() });
    }

    return queryBuilder.getMany();
  }

  /**
   * Obtener rol específico de usuario en tenant
   */
  async getUserRoleInTenant(userId: string, tenantId: string): Promise<UserTenantRole | null> {
    return this.userTenantRoleRepository.findOne({
      where: { userId, tenantId, isActive: true },
      relations: ['role', 'tenant'],
    });
  }

  /**
   * Obtener permisos efectivos de un usuario en un tenant
   */
  // async getUserEffectivePermissions(userId: string, tenantId: string): Promise<string[]> {
  //   const assignment = await this.getUserRoleInTenant(userId, tenantId);
    
  //   if (!assignment || !assignment.isCurrentlyActive) {
  //     return [];
  //   }

  //   let permissions = [...assignment.role.permissions];

  //   // Agregar permisos adicionales
  //   if (assignment.additionalPermissions) {
  //     permissions = [...permissions, ...assignment.additionalPermissions];
  //   }

  //   // Remover permisos denegados
  //   if (assignment.deniedPermissions) {
  //     permissions = permissions.filter(
  //       permission => !assignment.deniedPermissions.includes(permission)
  //     );
  //   }

  //   // Remover duplicados
  //   return [...new Set(permissions)];
  // }

  /**
   * Verificar si usuario tiene permiso específico en tenant
   */
  // async userHasPermission(userId: string, tenantId: string, permission: string): Promise<boolean> {
  //   const permissions = await this.getUserEffectivePermissions(userId, tenantId);
  //   return permissions.includes(permission) || permissions.includes('*') || permissions.includes('system.admin');
  // }

  /**
   * Actualizar asignación de rol
   */
  async update(id: string, updateDto: UpdateUserTenantRoleDto): Promise<UserTenantRole> {
    const assignment = await this.userTenantRoleRepository.findOne({
      where: { id },
      relations: ['role', 'user', 'tenant']
    });

    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    Object.assign(assignment, updateDto);

    return this.userTenantRoleRepository.save(assignment);
  }

  /**
   * Revocar rol (desactivar)
   */
  async revokeRole(id: string, revokedBy?: string): Promise<UserTenantRole> {
    const assignment = await this.userTenantRoleRepository.findOne({
      where: { id },
      relations: ['role', 'user', 'tenant']
    });

    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    assignment.isActive = false;
    assignment.notes = `${assignment.notes || ''} - Revocado ${revokedBy ? `por ${revokedBy}` : ''} el ${new Date().toISOString()}`;

    return this.userTenantRoleRepository.save(assignment);
  }

  /**
   * Eliminar asignación permanentemente
   */
  async remove(id: string): Promise<void> {
    const result = await this.userTenantRoleRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
  }

  /**
   * Obtener estadísticas de asignaciones
   */
  async getStats() {
    const total = await this.userTenantRoleRepository.count();
    const active = await this.userTenantRoleRepository.count({ where: { isActive: true } });
    
    const now = new Date();
    const expired = await this.userTenantRoleRepository
      .createQueryBuilder('utr')
      .where('utr.expiresAt < :now', { now })
      .getCount();

    return {
      total,
      active,
      inactive: total - active,
      expired,
      valid: total - expired
    };
  }
}