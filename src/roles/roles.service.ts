import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
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

    // Procesar permisos si se proporcionan
    let permissions: Permission[] = [];
    if (createRoleDto.permissionKeys && createRoleDto.permissionKeys.length > 0) {
      permissions = await this.permissionRepository.find({
        where: { key: In(createRoleDto.permissionKeys) }
      });

      if (permissions.length !== createRoleDto.permissionKeys.length) {
        throw new BadRequestException('Algunos permisos especificados no existen');
      }
    }

    // Crear el rol
    const role = this.roleRepository.create({
      ...createRoleDto,
      permissions
    });

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
      includePermissions = false,
      page = 1, 
      limit = 10 
    } = queryDto;

    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // Incluir permisos si se solicita
    if (includePermissions) {
      queryBuilder.leftJoinAndSelect('role.permissions', 'permission');
    }

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
  async findOne(id: string, includePermissions: boolean = true): Promise<Role> {
    const options: any = { where: { id } };
    
    if (includePermissions) {
      options.relations = ['permissions'];
    }

    const role = await this.roleRepository.findOne(options);

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  /**
   * Obtener un rol por slug
   */
  async findBySlug(slug: string, includePermissions: boolean = false): Promise<Role | null> {
    const options: any = { where: { slug } };
    
    if (includePermissions) {
      options.relations = ['permissions'];
    }

    return this.roleRepository.findOne(options);
  }

  /**
   * Actualizar un rol
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id, true);

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

    // Procesar permisos si se proporcionan
    if (updateRoleDto.permissionKeys) {
      const permissions = await this.permissionRepository.find({
        where: { key: In(updateRoleDto.permissionKeys) }
      });

      if (permissions.length !== updateRoleDto.permissionKeys.length) {
        throw new BadRequestException('Algunos permisos especificados no existen');
      }

      role.permissions = permissions;
    }

    // Actualizar los demás campos
    Object.assign(role, {
      ...updateRoleDto,
      permissionKeys: undefined // No guardar este campo en la entidad
    });

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
    const role = await this.findOne(id, false);

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
   * Agregar permisos a un rol (sin duplicados)
   */
  async addPermissions(id: string, permissionKeys: string[]): Promise<Role> {
    // 1. Obtener el rol con sus permisos actuales
    const role = await this.findOne(id, true);

    // 2. Obtener las entidades Permission por sus keys
    const newPermissions = await this.permissionRepository.find({
      where: { key: In(permissionKeys) }
    });

    // 3. Verificar que todos los permisos existen
    if (newPermissions.length !== permissionKeys.length) {
      const foundKeys = newPermissions.map(p => p.key);
      const missingKeys = permissionKeys.filter(key => !foundKeys.includes(key));
      throw new BadRequestException(`Los siguientes permisos no existen: ${missingKeys.join(', ')}`);
    }

    // 4. Filtrar permisos que NO estén ya asignados
    const existingPermissionKeys = role.permissions.map(p => p.key);
    const permissionsToAdd = newPermissions.filter(
      permission => !existingPermissionKeys.includes(permission.key)
    );

    if (permissionsToAdd.length === 0) {
      throw new BadRequestException('Todos los permisos ya están asignados a este rol');
    }

    // 5. Agregar los nuevos permisos
    role.permissions = [...role.permissions, ...permissionsToAdd];

    // 6. Guardar y retornar
    return await this.roleRepository.save(role);
  }

  /**
   * Remover permisos de un rol
   */
  async removePermissions(id: string, permissionKeys: string[]): Promise<Role> {
    // 1. Obtener el rol con sus permisos actuales
    const role = await this.findOne(id, true);

    // 2. Verificar que el rol tiene permisos para remover
    if (role.permissions.length === 0) {
      throw new BadRequestException('El rol no tiene permisos asignados');
    }

    // 3. Filtrar permisos (mantener los que NO están en permissionKeys)
    const originalCount = role.permissions.length;
    role.permissions = role.permissions.filter(
      permission => !permissionKeys.includes(permission.key)
    );

    // 4. Verificar que se removió al menos un permiso
    if (role.permissions.length === originalCount) {
      throw new BadRequestException('Ninguno de los permisos especificados estaba asignado al rol');
    }

    // 5. Guardar y retornar
    return await this.roleRepository.save(role);
  }

  /**
   * Actualizar todos los permisos de un rol (reemplazar completamente)
   */
  async updatePermissions(id: string, permissionKeys: string[]): Promise<Role> {
    // 1. Obtener el rol
    const role = await this.findOne(id, true);

    // 2. Si no se proporcionan permisos, limpiar todos
    if (permissionKeys.length === 0) {
      role.permissions = [];
      return await this.roleRepository.save(role);
    }

    // 3. Obtener todas las entidades Permission por sus keys
    const permissions = await this.permissionRepository.find({
      where: { key: In(permissionKeys) }
    });

    // 4. Verificar que todos los permisos existen
    if (permissions.length !== permissionKeys.length) {
      const foundKeys = permissions.map(p => p.key);
      const missingKeys = permissionKeys.filter(key => !foundKeys.includes(key));
      throw new BadRequestException(`Los siguientes permisos no existen: ${missingKeys.join(', ')}`);
    }

    // 5. Reemplazar todos los permisos
    role.permissions = permissions;

    // 6. Guardar y retornar
    return await this.roleRepository.save(role);
  }

  /**
   * Verificar si un rol tiene un permiso específico
   */
  async hasPermission(id: string, permissionKey: string): Promise<boolean> {
    const role = await this.findOne(id, true);
    return role.permissions.some(permission => permission.key === permissionKey);
  }

  /**
   * Obtener solo los permisos de un rol
   */
  async getPermissions(id: string): Promise<Permission[]> {
    const role = await this.findOne(id, true);
    return role.permissions;
  }

  /**
   * Verificar si un rol tiene múltiples permisos
   */
  async hasPermissions(id: string, permissionKeys: string[]): Promise<{ [key: string]: boolean }> {
    const role = await this.findOne(id, true);
    const rolePermissionKeys = role.permissions.map(p => p.key);
    
    const result: { [key: string]: boolean } = {};
    permissionKeys.forEach(key => {
      result[key] = rolePermissionKeys.includes(key);
    });
    
    return result;
  }


}