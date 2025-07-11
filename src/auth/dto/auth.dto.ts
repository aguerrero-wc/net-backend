import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'juan.perez1@test.com',
    description: 'Email del usuario'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario'
  })
  @IsString()
  @MinLength(1)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token básico (sin tenant)'
  })
  accessToken: string;

  @ApiProperty({
    example: 'bearer',
    description: 'Tipo de token'
  })
  tokenType: string;

  @ApiProperty({
    example: 3600,
    description: 'Tiempo de expiración en segundos'
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Información básica del usuario'
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    language: string;
  };

  @ApiProperty({
    description: 'Lista de tenants disponibles para el usuario',
    type: 'array'
  })
  availableTenants: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string;
    role: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export class JwtPayload {
  sub: string; // user ID
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}