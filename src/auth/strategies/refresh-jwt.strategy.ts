import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService, JwtPayload } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET') as string, // ✅ Sin <string>
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<Partial<User> & { refreshToken: string }> {
    const refreshToken = req.cookies?.refreshToken || req.get('Authorization')?.replace('Bearer', '').trim();
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }
    
    const user = await this.authService.validateRefreshToken(payload);
    
    if (!user) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    
    return {
      ...user,
      refreshToken,
    };
  }
}