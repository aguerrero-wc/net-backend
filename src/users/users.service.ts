import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Encriptar contraseña
    const saltRounds = 12; // Mayor seguridad
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Crear usuario
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      // Valores por defecto
      language: createUserDto.language || 'es',
      isActive: createUserDto.isActive ?? true,
      emailVerified: createUserDto.emailVerified ?? false,
      twoFactorEnabled: createUserDto.twoFactorEnabled ?? false,
    });

    const savedUser = await this.userRepository.save(user);

    // Remover password de la respuesta
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['tenantRoles', 'tenantRoles.tenant', 'tenantRoles.role']
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['tenantRoles', 'tenantRoles.tenant', 'tenantRoles.role']
    });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId: string, loginDate: Date, ip?: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: loginDate,
      lastLoginIp: ip,
    });
  }
}