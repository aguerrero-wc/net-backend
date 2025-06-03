import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual',
    example: 'OldPassword123!'
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NewPassword123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}