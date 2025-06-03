import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class ManagePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[];
}