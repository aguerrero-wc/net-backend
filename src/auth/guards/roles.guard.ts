import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Si no hay roles definidos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Obtener el usuario del request (viene de JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roleSlug) { // 🔥 Cambiar: verificar roleSlug
      throw new ForbiddenException('No tienes permisos para acceder a este recurso');
    }

    // 4. Verificar si el roleSlug del usuario está en los roles requeridos
    const hasRole = requiredRoles.includes(user.roleSlug); // 🔥 Simplificado

    if (!hasRole) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}