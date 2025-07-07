import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9._*-]+$/, {
    message: 'La clave debe contener solo letras minúsculas, números, puntos, guiones bajos, asteriscos y guiones'
  })
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  group: string;
}