import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantService } from '../tenants/tenants.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private tenantsService: TenantService,
    private rolesService: RolesService,
  ) {}

  // async create(createUserDto: CreateUserDto): Promise<User> {
  //   // Verificar que el tenant existe
  //   await this.tenantsService.findOne(createUserDto.tenantId);
    
  //   // Verificar que el rol existe y pertenece al tenant
  //   await this.rolesService.findOne(createUserDto.roleId, createUserDto.tenantId);

  //   // Verificar si el email ya existe
  //   const existingUser = await this.usersRepository.findOne({
  //     where: { email: createUserDto.email },
  //   });

  //   if (existingUser) {
  //     throw new ConflictException('Email already exists');
  //   }

  //   // Hashear la contraseña
  //   const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  //   const user = this.usersRepository.create({
  //     ...createUserDto,
  //     password: hashedPassword,
  //   });

  //   return this.usersRepository.save(user);
  // }

  // async findAll(tenantId: string): Promise<User[]> {
  //   return this.usersRepository.find({
  //     where: { tenantId },
  //     relations: ['tenant', 'role'],
  //   });
  // }

  // async findOne(id: string, tenantId: string): Promise<User> {
  //   const user = await this.usersRepository.findOne({
  //     where: { id, tenantId },
  //     relations: ['tenant', 'role'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID "${id}" not found in tenant "${tenantId}"`);
  //   }

  //   return user;
  // }

  // async update(id: string, tenantId: string, updateUserDto: UpdateUserDto): Promise<User> {
  //   const user = await this.findOne(id, tenantId);

  //   if (updateUserDto.roleId) {
  //     // Verificar que el nuevo rol existe y pertenece al tenant
  //     await this.rolesService.findOne(updateUserDto.roleId, tenantId);
  //   }

  //   if (updateUserDto.password) {
  //     // Hashear la nueva contraseña
  //     updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
  //   }

  //   Object.assign(user, updateUserDto);
  //   return this.usersRepository.save(user);
  // }

  // async remove(id: string, tenantId: string): Promise<void> {
  //   const result = await this.usersRepository.delete({ id, tenantId });
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`User with ID "${id}" not found in tenant "${tenantId}"`);
  //   }
  // }
} 