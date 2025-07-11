import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginResponseDto, JwtPayload } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // 1. Buscar usuario por email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException(`Usuario bloqueado: ${user.blockedReason || 'Sin razón especificada'}`);
    }

    // 3. Validar contraseña
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Generar JWT básico (sin tenant)
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = this.jwtService.sign(payload);

    // 5. Obtener tenants disponibles
    const availableTenants = this.extractAvailableTenants(user);

    // 6. Actualizar última conexión
    await this.updateLastLogin(user.id);

    return {
      accessToken,
      tokenType: 'bearer',
      expiresIn: 3600, // 1 hora
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        language: user.language,
      },
      availableTenants,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return user;
  }

  private extractAvailableTenants(user: User) {
    if (!user.tenantRoles || user.tenantRoles.length === 0) {
      return [];
    }

    return user.tenantRoles
      .filter(utr => utr.isCurrentlyActive && utr.tenant.isActive && !utr.tenant.isSuspended)
      .map(utr => ({
        id: utr.tenant.id,
        name: utr.tenant.name,
        slug: utr.tenant.slug,
        logo: utr.tenant.logo,
        role: {
          id: utr.role.id,
          name: utr.role.name,
          slug: utr.role.slug,
        },
      }));
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.usersService.updateLastLogin(userId, new Date());
    } catch (error) {
      console.warn('No se pudo actualizar el último login:', error);
    }
  }
}