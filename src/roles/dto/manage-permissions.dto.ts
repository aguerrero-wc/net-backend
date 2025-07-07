import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManagePermissionsDto {
  @ApiProperty({
    description: 'Array de keys de permisos',
    example: ['users.create', 'users.read', 'content.update'],
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionKeys: string[];
}