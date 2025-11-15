import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), // Nivel método
      context.getClass(),   // Nivel controlador
    ]);

    // 2. Si no hay roles definidos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Obtener el usuario del request (viene de JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('No tienes permisos para acceder a este recurso');
    }

    // 4. Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.some((roleName) => {
      // Buscar por name o por slug
      return user.role.name === roleName || user.role.slug === roleName;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}