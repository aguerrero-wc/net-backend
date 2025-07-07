import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { CreateBulkPermissionsDto } from './dto/create-bulk-permissions.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Crear un nuevo permiso
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Verificar si la key ya existe
    const existingPermission = await this.permissionRepository.findOne({
      where: { key: createPermissionDto.key }
    });

    if (existingPermission) {
      throw new ConflictException(`El permiso con key '${createPermissionDto.key}' ya existe`);
    }

    // Crear el permiso
    const permission = this.permissionRepository.create(createPermissionDto);

    try {
      return await this.permissionRepository.save(permission);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException(`El permiso con key '${createPermissionDto.key}' ya existe`);
      }
      throw error;
    }
  }

  /**
   * Crear múltiples permisos de una vez
   */
  async createBulk(createBulkDto: CreateBulkPermissionsDto): Promise<Permission[]> {
    const { permissions } = createBulkDto;
    
    // Extraer todas las keys
    const keys = permissions.map(p => p.key);
    
    // Verificar duplicados en el array
    const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicateKeys.length > 0) {
      throw new BadRequestException(`Keys duplicadas en la solicitud: ${duplicateKeys.join(', ')}`);
    }

    // Verificar si alguna key ya existe en la base de datos
    const existingPermissions = await this.permissionRepository.find({
      where: { key: In(keys) }
    });

    if (existingPermissions.length > 0) {
      const existingKeys = existingPermissions.map(p => p.key);
      throw new ConflictException(`Los siguientes permisos ya existen: ${existingKeys.join(', ')}`);
    }

    // Crear todos los permisos
    const permissionEntities = this.permissionRepository.create(permissions);

    try {
      return await this.permissionRepository.save(permissionEntities);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Uno o más permisos ya existen');
      }
      throw error;
    }
  }

  /**
   * Obtener todos los permisos con filtros y paginación
   */
  async findAll(queryDto: QueryPermissionDto) {
    const { 
      search, 
      group, 
      key,
      page = 1, 
      limit = 10 
    } = queryDto;

    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(permission.key ILIKE :search OR permission.description ILIKE :search OR permission.group ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (group) {
      queryBuilder.andWhere('permission.group = :group', { group });
    }

    if (key) {
      queryBuilder.andWhere('permission.key ILIKE :key', { key: `%${key}%` });
    }

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento por grupo y luego por key
    queryBuilder.orderBy('permission.group', 'ASC').addOrderBy('permission.key', 'ASC');

    const [permissions, total] = await queryBuilder.getManyAndCount();

    return {
      data: permissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener todos los permisos agrupados
   */
  async findAllGrouped() {
    const permissions = await this.permissionRepository.find({
      order: {
        group: 'ASC',
        key: 'ASC'
      }
    });

    // Agrupar por grupo
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.group]) {
        acc[permission.group] = [];
      }
      acc[permission.group].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return grouped;
  }

  /**
   * Obtener un permiso por ID
   */
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permission;
  }

  /**
   * Obtener un permiso por key
   */
  async findByKey(key: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { key }
    });
  }

  /**
   * Obtener múltiples permisos por keys
   */
  async findByKeys(keys: string[]): Promise<Permission[]> {
    if (keys.length === 0) {
      return [];
    }

    return this.permissionRepository.find({
      where: { key: In(keys) }
    });
  }

  /**
   * Obtener permisos por grupo
   */
  async findByGroup(group: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { group },
      order: { key: 'ASC' }
    });
  }

  /**
   * Obtener todos los grupos únicos
   */
  async getGroups(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.group', 'group')
      .orderBy('permission.group', 'ASC')
      .getRawMany();

    return result.map(item => item.group);
  }

  /**
   * Actualizar un permiso
   */
  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // Si se está actualizando la key, verificar que no exista
    if (updatePermissionDto.key && updatePermissionDto.key !== permission.key) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { key: updatePermissionDto.key }
      });

      if (existingPermission) {
        throw new ConflictException(`El permiso con key '${updatePermissionDto.key}' ya existe`);
      }
    }

    // Actualizar los campos
    Object.assign(permission, updatePermissionDto);

    try {
      return await this.permissionRepository.save(permission);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`El permiso con key '${updatePermissionDto.key}' ya existe`);
      }
      throw error;
    }
  }

  /**
   * Eliminar un permiso
   */
  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);

    // TODO: Verificar que no haya roles asignados a este permiso
    // const rolesWithPermission = await this.roleRepository
    //   .createQueryBuilder('role')
    //   .leftJoin('role.permissions', 'permission')
    //   .where('permission.id = :permissionId', { permissionId: id })
    //   .getCount();

    // if (rolesWithPermission > 0) {
    //   throw new BadRequestException('No se puede eliminar un permiso que está asignado a roles');
    // }

    await this.permissionRepository.remove(permission);
  }

  /**
   * Eliminar múltiples permisos
   */
  async removeBulk(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un ID');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(ids) }
    });

    if (permissions.length !== ids.length) {
      throw new NotFoundException('Uno o más permisos no fueron encontrados');
    }

    // TODO: Verificar que ningún permiso esté asignado a roles

    await this.permissionRepository.remove(permissions);
  }

  /**
   * Obtener estadísticas de permisos
   */
  async getStats() {
    const total = await this.permissionRepository.count();
    
    // Estadísticas por grupo
    const groupStats = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('permission.group', 'group')
      .addSelect('COUNT(*)', 'count')
      .groupBy('permission.group')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total,
      groups: groupStats.length,
      byGroup: groupStats.map(stat => ({
        group: stat.group,
        count: parseInt(stat.count)
      }))
    };
  }

  /**
   * Crear permisos por defecto del sistema
   */
  async createDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // Sistema
      { key: 'system.admin', description: 'Administrar sistema completo', group: 'Sistema' },
      { key: 'system.config', description: 'Configurar sistema', group: 'Sistema' },
      
      // Usuarios
      { key: 'users.create', description: 'Crear usuarios', group: 'Usuarios' },
      { key: 'users.read', description: 'Ver usuarios', group: 'Usuarios' },
      { key: 'users.update', description: 'Actualizar usuarios', group: 'Usuarios' },
      { key: 'users.delete', description: 'Eliminar usuarios', group: 'Usuarios' },
      { key: 'users.*', description: 'Gestión completa de usuarios', group: 'Usuarios' },
      
      // Roles
      { key: 'roles.create', description: 'Crear roles', group: 'Roles' },
      { key: 'roles.read', description: 'Ver roles', group: 'Roles' },
      { key: 'roles.update', description: 'Actualizar roles', group: 'Roles' },
      { key: 'roles.delete', description: 'Eliminar roles', group: 'Roles' },
      { key: 'roles.*', description: 'Gestión completa de roles', group: 'Roles' },
      
      // Tenants
      { key: 'tenants.create', description: 'Crear tenants', group: 'Tenants' },
      { key: 'tenants.read', description: 'Ver tenants', group: 'Tenants' },
      { key: 'tenants.update', description: 'Actualizar tenants', group: 'Tenants' },
      { key: 'tenants.delete', description: 'Eliminar tenants', group: 'Tenants' },
      { key: 'tenants.*', description: 'Gestión completa de tenants', group: 'Tenants' },
      { key: 'tenant.admin', description: 'Administrar tenant específico', group: 'Tenants' },
      
      // Contenido
      { key: 'content.create', description: 'Crear contenido', group: 'Contenido' },
      { key: 'content.read', description: 'Ver contenido', group: 'Contenido' },
      { key: 'content.update', description: 'Actualizar contenido', group: 'Contenido' },
      { key: 'content.delete', description: 'Eliminar contenido', group: 'Contenido' },
      { key: 'content.*', description: 'Gestión completa de contenido', group: 'Contenido' },
      
      // Permisos
      { key: 'permissions.create', description: 'Crear permisos', group: 'Permisos' },
      { key: 'permissions.read', description: 'Ver permisos', group: 'Permisos' },
      { key: 'permissions.update', description: 'Actualizar permisos', group: 'Permisos' },
      { key: 'permissions.delete', description: 'Eliminar permisos', group: 'Permisos' },
      { key: 'permissions.*', description: 'Gestión completa de permisos', group: 'Permisos' },
    ];

    for (const permissionData of defaultPermissions) {
      const existingPermission = await this.findByKey(permissionData.key);
      if (!existingPermission) {
        await this.create(permissionData);
      }
    }
  }
}