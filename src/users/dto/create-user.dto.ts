import { IsString, IsEmail, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsUUID()
  roleId: string;

  @IsUUID()
  tenantId: string;
} 