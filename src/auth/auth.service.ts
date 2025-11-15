import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserTenantRolesService } from '../user-tenant-roles/user-tenant-roles.service';

import { User } from '../users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

export interface JwtPayload {
  tenantId: string;
  roleId?: string;
  roleSlug?: string;
  sub: string;      // userId
  email: string;
  iat?: number;     // issued at
  exp?: number;     // expiration
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTenantRolesService: UserTenantRolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registro de usuario
   */
  async signUp(signUpDto: SignUpDto): Promise<Omit<User, 'password'>> {
    // El UsersService ya maneja el hash de la contraseña
    return this.usersService.create(signUpDto);
  }

  /**
   * Inicio de sesión
   * Valida credenciales y genera tokens
   */
  async signIn(signInDto: SignInDto, ip: string): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    // 1. Validar credenciales
    const userPayload = await this.validateUser(signInDto.identifier, signInDto.password, signInDto.tenantId);

    if (!userPayload) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Generar tokens
    const tokens = await this.generateTokens(signInDto.tenantId, userPayload.id, userPayload.email, userPayload.roleId, userPayload.roleSlug);

    // 5. Guardar el hash del refresh token en la BD
    await this.usersService.updateRefreshToken(userPayload.id, tokens.refreshToken);

    // 6. Actualizar último login
    await this.usersService.updateLastLogin(userPayload.id, ip);

    // 7. Retornar tokens y usuario (sin datos sensibles)
    const { password, hashedRefreshToken, emailVerificationToken, twoFactorSecret, ...userWithoutSensitiveData } = userPayload;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutSensitiveData
    };
  }

  /**
   * Validar credenciales de usuario (usado por LocalStrategy)
   */
  async validateUser(identifier: string, password: string, tenantId: string): Promise<any> {
    
    if (!identifier || !password || !tenantId) {
      return null;
    }

    const user = await this.usersService.findByEmailOrNickname(identifier);
    
    if (!user) {
      return null;
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const userTenantRole = await this.userTenantRolesService.getUserRoleInTenant(user.id, tenantId);
    if (!userTenantRole) {
      throw new UnauthorizedException('No tienes acceso a este tenant');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: tenantId,
      roleId: userTenantRole.roleId,
      roleName: userTenantRole.role.name,
      roleSlug: userTenantRole.role.slug,
    };
  }

  /**
   * Refrescar tokens
   * Valida el refresh token y genera nuevos tokens
   */
  async refreshTokens(userId: string, tenantId: string, refreshToken: string): Promise<AuthTokens> {
    // 1. Validar que el refresh token coincida con el almacenado
    const user = await this.usersService.getUserIfRefreshTokenMatches(userId, refreshToken);

    if (!user) {
      throw new UnauthorizedException('Refresh token inválido o revocado');
    }

    // 3. 🔥 Buscar el rol del usuario en el tenant
    const userTenantRole = await this.userTenantRolesService.getUserRoleInTenant(userId, tenantId);

    if (!userTenantRole ) {
      throw new UnauthorizedException('Ya no tienes acceso a este tenant');
    }

    // 4. Generar nuevos tokens con roleId y roleSlug
    const tokens = await this.generateTokens(
      tenantId, 
      user.id, 
      user.email,
      userTenantRole.roleId,
      userTenantRole.role.slug
    );

    // 5. Actualizar el refresh token en la BD (invalida el anterior)
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Cerrar sesión
   * Invalida el refresh token del usuario
   */
  async signOut(userId: string): Promise<void> {
    // Remover el refresh token de la BD
    await this.usersService.removeRefreshToken(userId);
  }

  /**
   * Generar Access Token y Refresh Token
   */
  private async generateTokens( tenantId: string, userId: string, email: string, roleId: string, roleSlug: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      tenantId,
      sub: userId,
      email,
      roleId,
      roleSlug,
    };

    // Obtener configuración
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiration = this.configService.get('JWT_ACCESS_EXPIRATION') || '15m';
    const refreshExpiration = this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token: corta duración (15 minutos)
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration,
      }),
      // Refresh Token: larga duración (7 días)
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validar Access Token (usado por JwtStrategy)
   */
  async validateAccessToken(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Usuario bloqueado');
    }

    return user;
  }

  /**
   * Validar Refresh Token (usado por RefreshStrategy)
   */
  async validateRefreshToken(payload: JwtPayload, refreshToken: string) {
    // 🔥 Usar el método que ya existe (corregido)
    const user = await this.usersService.getUserIfRefreshTokenMatches(
      payload.sub,
      refreshToken
    );
    
    if (!user) {
      return null;
    }
    
    return user;
  }
}