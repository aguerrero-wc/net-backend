import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  lastName: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez'
  })
  fullName: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@example.com'
  })
  email: string;

  @ApiPropertyOptional({
    description: 'URL del avatar',
    example: 'https://example.com/avatar.jpg'
  })
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '+57 300 123 4567'
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Zona horaria',
    example: 'America/Bogota'
  })
  timezone?: string;

  @ApiProperty({
    description: 'Idioma preferido',
    example: 'es'
  })
  language: string;

  @ApiPropertyOptional({
    description: 'Preferencias del usuario',
    example: { theme: 'dark', notifications: true }
  })
  preferences?: Record<string, any>;

  @ApiProperty({
    description: 'Si el email está verificado',
    example: true
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Si el 2FA está habilitado',
    example: false
  })
  twoFactorEnabled: boolean;

  @ApiPropertyOptional({
    description: 'Último inicio de sesión',
    example: '2025-06-03T09:00:00Z'
  })
  lastLoginAt?: Date;

  @ApiPropertyOptional({
    description: 'IP del último inicio de sesión',
    example: '192.168.1.1'
  })
  lastLoginIp?: string;

  @ApiProperty({
    description: 'Si el usuario está activo',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Si el usuario está bloqueado',
    example: false
  })
  isBlocked: boolean;

  @ApiPropertyOptional({
    description: 'Razón del bloqueo',
    example: 'Actividad sospechosa'
  })
  blockedReason?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-06-03T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-06-03T10:00:00Z'
  })
  updatedAt: Date;

  // Campos excluidos de la respuesta
  @Exclude()
  password: string;

  @Exclude()
  emailVerificationToken?: string;

  @Exclude()
  twoFactorSecret?: string;
}