import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Crear un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar si el name o slug ya existen
    const existingRole = await this.roleRepository.findOne({
      where: [
        { name: createRoleDto.name },
        { slug: createRoleDto.slug }
      ]
    });

    if (existingRole) {
      if (existingRole.name === createRoleDto.name) {
        throw new ConflictException('El nombre del rol ya existe');
      }
      if (existingRole.slug === createRoleDto.slug) {
        throw new ConflictException('El slug del rol ya existe');
      }
    }

    // Crear el rol
    const role = this.roleRepository.create(createRoleDto);

    try {
      return await this.roleRepository.save(role);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('El nombre o slug del rol ya existe');
      }
      throw error;
    }
  }

  /**
   * Obtener todos los roles con filtros y paginación
   */
  async findAll(queryDto: QueryRoleDto) {
    const { 
      search, 
      isActive, 
      isSystemRole, 
      minLevel,
      page = 1, 
      limit = 10 
    } = queryDto;

    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(role.name ILIKE :search OR role.slug ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('role.isActive = :isActive', { isActive });
    }

    if (typeof isSystemRole === 'boolean') {
      queryBuilder.andWhere('role.isSystemRole = :isSystemRole', { isSystemRole });
    }

    if (typeof minLevel === 'number') {
      queryBuilder.andWhere('role.level >= :minLevel', { minLevel });
    }

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento por level (mayor a menor) y luego por nombre
    queryBuilder.orderBy('role.level', 'DESC').addOrderBy('role.name', 'ASC');

    const [roles, total] = await queryBuilder.getManyAndCount();

    return {
      data: roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener un rol por ID
   */
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id }
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  /**
   * Obtener un rol por slug
   */
  async findBySlug(slug: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { slug }
    });
  }

  /**
   * Actualizar un rol
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Verificar si es un rol del sistema y se está intentando cambiar propiedades críticas
    if (role.isSystemRole) {
      if (updateRoleDto.slug && updateRoleDto.slug !== role.slug) {
        throw new BadRequestException('No se puede cambiar el slug de un rol del sistema');
      }
      if (typeof updateRoleDto.isSystemRole === 'boolean' && !updateRoleDto.isSystemRole) {
        throw new BadRequestException('No se puede cambiar la propiedad isSystemRole de un rol del sistema');
      }
    }

    // Si se está actualizando el name o slug, verificar que no existan
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name }
      });

      if (existingRole) {
        throw new ConflictException('El nombre del rol ya existe');
      }
    }

    if (updateRoleDto.slug && updateRoleDto.slug !== role.slug) {
      const existingRole = await this.roleRepository.findOne({
        where: { slug: updateRoleDto.slug }
      });

      if (existingRole) {
        throw new ConflictException('El slug del rol ya existe');
      }
    }

    // Actualizar los campos
    Object.assign(role, updateRoleDto);

    try {
      return await this.roleRepository.save(role);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('El nombre o slug del rol ya existe');
      }
      throw error;
    }
  }

  /**
   * Activar/desactivar rol
   */
  async toggleActive(id: string): Promise<Role> {
    const role = await this.findOne(id);

    // No permitir desactivar roles del sistema críticos
    if (role.isSystemRole && role.isActive && (role.slug === 'super-admin' || role.level >= 100)) {
      throw new BadRequestException('No se puede desactivar un rol super-admin del sistema');
    }

    const updatedRole = await this.roleRepository.save({
      ...role,
      isActive: !role.isActive
    });

    return updatedRole;
  }

  /**
   * Agregar permisos a un rol
   */
  async addPermissions(id: string, permissions: string[]): Promise<Role> {
    const role = await this.findOne(id);

    // Combinar permisos existentes con nuevos (sin duplicados)
    const uniquePermissions = [...new Set([...role.permissions, ...permissions])];

    const updatedRole = await this.roleRepository.save({
      ...role,
      permissions: uniquePermissions
    });

    return updatedRole;
  }

  /**
   * Remover permisos de un rol
   */
  async removePermissions(id: string, permissions: string[]): Promise<Role> {
    const role = await this.findOne(id);

    // Filtrar permisos
    const filteredPermissions = role.permissions.filter(
      permission => !permissions.includes(permission)
    );

    const updatedRole = await this.roleRepository.save({
      ...role,
      permissions: filteredPermissions
    });

    return updatedRole;
  }

  /**
   * Verificar si un rol tiene un permiso específico
   */
  async hasPermission(id: string, permission: string): Promise<boolean> {
    const role = await this.findOne(id);
    return role.permissions.includes(permission);
  }

  /**
   * Obtener roles por nivel mínimo
   */
  async findByMinLevel(minLevel: number): Promise<Role[]> {
    return this.roleRepository.find({
      where: {
        level: minLevel,
        isActive: true
      },
      order: {
        level: 'DESC',
        name: 'ASC'
      }
    });
  }

  /**
   * Eliminar rol (solo si no es del sistema)
   */
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new BadRequestException('No se puede eliminar un rol del sistema');
    }

    // TODO: Verificar que no haya usuarios asignados a este rol
    // const usersWithRole = await this.userTenantRoleRepository.count({ where: { roleId: id } });
    // if (usersWithRole > 0) {
    //   throw new BadRequestException('No se puede eliminar un rol que tiene usuarios asignados');
    // }

    await this.roleRepository.remove(role);
  }

  /**
   * Obtener estadísticas de roles
   */
  async getStats() {
    const total = await this.roleRepository.count();
    const active = await this.roleRepository.count({ where: { isActive: true } });
    const systemRoles = await this.roleRepository.count({ where: { isSystemRole: true } });
    const customRoles = await this.roleRepository.count({ where: { isSystemRole: false } });

    // Estadísticas por nivel
    const adminRoles = await this.roleRepository.count({ 
      where: { level: 90, isActive: true } 
    });
    const editorRoles = await this.roleRepository.count({ 
      where: { level: 50, isActive: true } 
    });
    const viewerRoles = await this.roleRepository.count({ 
      where: { level: 10, isActive: true } 
    });

    return {
      total,
      active,
      inactive: total - active,
      systemRoles,
      customRoles,
      byLevel: {
        admin: adminRoles,
        editor: editorRoles,
        viewer: viewerRoles
      }
    };
  }

  /**
   * Crear roles del sistema por defecto
   */
  async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'Super Administrador',
        slug: 'super-admin',
        description: 'Acceso completo al sistema',
        color: '#EF4444',
        icon: 'crown',
        permissions: ['system.admin', 'users.*', 'roles.*', 'tenants.*'],
        level: 100,
        isActive: true,
        isSystemRole: true
      },
      {
        name: 'Administrador de Tenant',
        slug: 'tenant-admin',
        description: 'Administra completamente un tenant específico',
        color: '#F59E0B',
        icon: 'shield-check',
        permissions: ['tenant.admin', 'users.*', 'content.*'],
        level: 90,
        isActive: true,
        isSystemRole: true
      },
      {
        name: 'Editor',
        slug: 'editor',
        description: 'Puede crear y editar contenido',
        color: '#3B82F6',
        icon: 'edit',
        permissions: ['content.create', 'content.read', 'content.update', 'users.read'],
        level: 50,
        isActive: true,
        isSystemRole: true
      },
      {
        name: 'Visualizador',
        slug: 'viewer',
        description: 'Solo puede ver contenido',
        color: '#10B981',
        icon: 'eye',
        permissions: ['content.read'],
        level: 10,
        isActive: true,
        isSystemRole: true
      }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.findBySlug(roleData.slug);
      if (!existingRole) {
        await this.create(roleData as CreateRoleDto);
      }
    }
  }
}