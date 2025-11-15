import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'identifier', // Por defecto Passport busca 'username', cambiamos a 'email'
      passwordField: 'password',
      passReqToCallback: true, // Accede al body completo
    });
  }

  /**
   * Passport ejecuta automáticamente este método cuando se usa LocalAuthGuard
   * Recibe email y password del request body
   */
  async validate(req:any, identifier: string, password: string): Promise<User> {
    const tenantId = req.body.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID no proporcionado');
    }


    const userPayload = await this.authService.validateUser(identifier, password, tenantId);
    
    if (!userPayload) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    // Si es válido, Passport adjunta el usuario a request.user
    return userPayload;
  }
}