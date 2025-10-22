import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (config: ConfigService): JwtModuleOptions => ({
  secret: config.get<string>('JWT_ACCESS_SECRET'),
  signOptions: {
    expiresIn: config.get('JWT_ACCESS_EXPIRATION') || '15m',
  },
});