import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Por defecto Passport busca 'username', cambiamos a 'email'
      passwordField: 'password',
    });
  }

  /**
   * Passport ejecuta automáticamente este método cuando se usa LocalAuthGuard
   * Recibe email y password del request body
   */
  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    // Si es válido, Passport adjunta el usuario a request.user
    return user;
  }
}