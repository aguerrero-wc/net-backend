// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  ConflictException, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

// Mock de bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  // 🎭 Mocks de datos (basados en ENTIDADES)
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    password: 'hashed_password',
    hashedRefreshToken: null,
    avatar: null,
    phone: null,
    timezone: null,
    language: 'es',
    preferences: null,
    emailVerified: false,
    emailVerificationToken: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    lastLoginAt: null,
    lastLoginIp: null,
    isActive: true,
    isBlocked: false,
    blockedReason: null,
    tenantRoles: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // 🔥 TESTS DE create() - PRIORIDAD ALTA
  // ==========================================
  describe('create', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'Andres',
      lastName: 'Guerrero',
      email: 'info@windowschannel.com',
      password: 'Password123!',
    };

    it('✅ debe crear un usuario exitosamente', async () => {
      // Arrange - fase de preparacion donde se definen los
      // valores iniciales de los objetos y las variables 
      mockRepository.findOne.mockResolvedValue(null); // Email no existe
      mockRepository.create.mockReturnValue({
        ...createUserDto,
        password: 'hashed_password',
      });
      mockRepository.save.mockResolvedValue({
        id: 'new-uuid',
        ...createUserDto,
        password: 'hashed_password',
        emailVerificationToken: 'token123',
        twoFactorSecret: 'secret123',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed_password',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('emailVerificationToken');
      expect(result).not.toHaveProperty('twoFactorSecret');
      expect(result).toHaveProperty('fullName', 'Andres Guerrero');
    });

    it('❌ debe lanzar ConflictException si el email ya existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'El email ya está registrado'
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('🔐 debe hashear la contraseña antes de guardar', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...createUserDto });
      mockRepository.save.mockResolvedValue({
        id: 'uuid',
        ...createUserDto,
        password: 'hashed_password',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Act
      await service.create(createUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed_password',
        })
      );
    });

    it('❌ debe manejar error de BD (código 23505)', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...createUserDto });
      mockRepository.save.mockRejectedValue({ code: '23505' }); // Unique violation
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  // ==========================================
  // 🔥 TESTS DE updatePassword() - PRIORIDAD ALTA
  // ==========================================
  describe('updatePassword', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    };

    it('✅ debe cambiar la contraseña exitosamente', async () => {
      // Arrange
      const userWithPassword = {
        id: userId,
        password: 'hashed_old_password',
      };
      mockRepository.findOne.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      await service.updatePassword(userId, updatePasswordDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'password'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'OldPassword123!',
        'hashed_old_password'
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword456!', 12);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, {
        password: 'hashed_new_password',
      });
    });

    it('❌ debe lanzar NotFoundException si usuario no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updatePassword(userId, updatePasswordDto)
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updatePassword(userId, updatePasswordDto)
      ).rejects.toThrow(`Usuario con ID ${userId} no encontrado`);
    });

    it('❌ debe lanzar UnauthorizedException si contraseña actual es incorrecta', async () => {
      // Arrange
      const userWithPassword = {
        id: userId,
        password: 'hashed_old_password',
      };
      mockRepository.findOne.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Contraseña incorrecta

      // Act & Assert
      await expect(
        service.updatePassword(userId, updatePasswordDto)
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.updatePassword(userId, updatePasswordDto)
      ).rejects.toThrow('La contraseña actual es incorrecta');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('🔐 debe hashear la nueva contraseña', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue({
        id: userId,
        password: 'hashed_old_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      await service.updatePassword(userId, updatePasswordDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword456!', 12);
    });
  });

  // ==========================================
  // 🔥 TESTS DE getUserIfRefreshTokenMatches() - PRIORIDAD ALTA
  // ==========================================
  describe('getUserIfRefreshTokenMatches', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const refreshToken = 'valid_refresh_token';

    const userWithRefreshToken = {
      id: userId,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      hashedRefreshToken: 'hashed_refresh_token',
      avatar: null,
      phone: null,
      timezone: null,
      language: 'es',
      preferences: null,
      emailVerified: true,
      twoFactorEnabled: false,
      lastLoginAt: new Date(),
      lastLoginIp: '192.168.1.1',
      isActive: true,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('✅ debe retornar usuario si el refresh token coincide', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.getUserIfRefreshTokenMatches(
        userId,
        refreshToken
      );

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.arrayContaining(['id', 'email', 'hashedRefreshToken']),
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        'hashed_refresh_token'
      );
      expect(result).toBeDefined();
      expect(result?.id).toBe(userId);
      expect(result).not.toHaveProperty('hashedRefreshToken'); // No debe incluirlo
    });

    it('❌ debe retornar null si el token no coincide', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Token no coincide

      // Act
      const result = await service.getUserIfRefreshTokenMatches(
        userId,
        refreshToken
      );

      // Assert
      expect(result).toBeNull();
    });

    it('❌ debe retornar null si usuario no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getUserIfRefreshTokenMatches(
        userId,
        refreshToken
      );

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('❌ debe retornar null si no hay hashedRefreshToken', async () => {
      // Arrange
      const userWithoutToken = { ...userWithRefreshToken, hashedRefreshToken: null };
      mockRepository.findOne.mockResolvedValue(userWithoutToken);

      // Act
      const result = await service.getUserIfRefreshTokenMatches(
        userId,
        refreshToken
      );

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('🔐 no debe incluir hashedRefreshToken en la respuesta', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.getUserIfRefreshTokenMatches(
        userId,
        refreshToken
      );

      // Assert
      expect(result).not.toHaveProperty('hashedRefreshToken');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
    });
  });
});