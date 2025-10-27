import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(3)
  identifier: string; 

  @IsString()
  @MinLength(1)
  password: string;
}