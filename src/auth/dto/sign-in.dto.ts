import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class SignInDto {

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  identifier: string; 

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  password: string;
}