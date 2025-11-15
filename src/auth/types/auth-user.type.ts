import { Role } from '../../roles/entities/role.entity';

/**
 * Representa el usuario autenticado en el contexto de una request
 */
export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  roleId: string;
  role?: Role;  // Opcional: si lo cargas en la strategy
}

/**
 * Usuario autenticado con refresh token
 */
export interface AuthUserWithRefreshToken extends AuthUser {
  refreshToken: string;
}