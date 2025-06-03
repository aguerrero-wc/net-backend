export class RoleResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  permissions: string[];
  level: number;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}