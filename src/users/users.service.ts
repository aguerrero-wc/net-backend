// src/users/users.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  UnauthorizedException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Excluir campos sensibles de la respuesta
   */
  private excludeSensitiveFields(user: User): Omit<User, 'password' | 'emailVerificationToken' | 'twoFactorSecret'> {
    const { password, emailVerificationToken, twoFactorSecret, ...userResponse } = user;
    return {
      ...userResponse,
      fullName: `${userResponse.firstName} ${userResponse.lastName}`
    } as any;
  }

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Crear el usuario
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      
      // Retornar usuario sin campos sensibles
      const { password, emailVerificationToken, twoFactorSecret, ...userResponse } = savedUser;
      
      return {
        ...userResponse,
        fullName: `${userResponse.firstName} ${userResponse.lastName}`
      } as User;
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con filtros y paginación
   */
  async findAll(queryDto: QueryUserDto) {
    const { 
      search, 
      email, 
      isActive, 
      isBlocked, 
      emailVerified, 
      twoFactorEnabled,
      page = 1, 
      limit = 10 
    } = queryDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (email) {
      queryBuilder.andWhere('user.email = :email', { email });
    }

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (typeof isBlocked === 'boolean') {
      queryBuilder.andWhere('user.isBlocked = :isBlocked', { isBlocked });
    }

    if (typeof emailVerified === 'boolean') {
      queryBuilder.andWhere('user.emailVerified = :emailVerified', { emailVerified });
    }

    if (typeof twoFactorEnabled === 'boolean') {
      queryBuilder.andWhere('user.twoFactorEnabled = :twoFactorEnabled', { twoFactorEnabled });
    }

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ordenamiento
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Excluir campos sensibles
    queryBuilder.select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.avatar',
      'user.phone',
      'user.timezone',
      'user.language',
      'user.preferences',
      'user.emailVerified',
      'user.twoFactorEnabled',
      'user.lastLoginAt',
      'user.lastLoginIp',
      'user.isActive',
      'user.isBlocked',
      'user.blockedReason',
      'user.createdAt',
      'user.updatedAt'
    ]);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Agregar fullName computed property
    const usersWithFullName = users.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    }));

    return {
      data: usersWithFullName,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'avatar',
        'phone',
        'timezone',
        'language',
        'preferences',
        'emailVerified',
        'twoFactorEnabled',
        'lastLoginAt',
        'lastLoginIp',
        'isActive',
        'isBlocked',
        'blockedReason',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    } as User;
  }

  /**
   * Obtener un usuario por email (para autenticación)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'avatar',
        'phone',
        'timezone',
        'language',
        'preferences',
        'emailVerified',
        'twoFactorEnabled',
        'twoFactorSecret',
        'lastLoginAt',
        'lastLoginIp',
        'isActive',
        'isBlocked',
        'blockedReason',
        'createdAt',
        'updatedAt'
      ]
    });
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.findOne(id);

    // Si se está actualizando el email, verificar que no exista
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Actualizar los campos
    Object.assign(user, updateUserDto);

    try {
      const updatedUser = await this.userRepository.save(user);
      return this.excludeSensitiveFields(updatedUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 12);

    // Actualizar contraseña
    await this.userRepository.update(id, { password: hashedPassword });
  }


  /**
   * Eliminar usuario (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Soft delete - desactivar en lugar de eliminar
    await this.userRepository.save({
      ...user,
      isActive: false,
      email: `deleted_${Date.now()}_${user.email}` // Liberar el email
    });
  }

  /**
   * Eliminar usuario permanentemente (solo para administradores)
   */
  async hardDelete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(id: string, ip: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip
    });
  }

}