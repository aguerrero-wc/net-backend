export interface RoleData {
  name: string;
  slug: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  isSystemRole: boolean;
  permissionKeys: string[]; // Keys de los permisos que tendrá
}

export const rolesData: RoleData[] = [
  // ============================================
  // 👑 SUPER ADMIN
  // ============================================
  {
    name: 'Super Administrador',
    slug: 'super-admin',
    description: 'Acceso total al sistema. Puede gestionar todos los tenants, usuarios, roles y permisos.',
    level: 100,
    color: '#DC2626', // Rojo
    icon: 'crown',
    isSystemRole: true,
    permissionKeys: [
      // TODOS los permisos
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'users.list',
      'users.block',
      'users.unblock',
      'users.view-sensitive',
      
      'tenants.create',
      'tenants.read',
      'tenants.update',
      'tenants.delete',
      'tenants.list',
      'tenants.suspend',
      'tenants.activate',
      'tenants.configure',
      'tenants.manage-plan',
      
      'roles.create',
      'roles.read',
      'roles.update',
      'roles.delete',
      'roles.list',
      'roles.assign-permissions',
      
      'permissions.create',
      'permissions.read',
      'permissions.update',
      'permissions.delete',
      'permissions.list',
      
      'user-tenant-roles.create',
      'user-tenant-roles.read',
      'user-tenant-roles.update',
      'user-tenant-roles.delete',
      'user-tenant-roles.list',
      'user-tenant-roles.manage-custom-permissions',
      
      'system.view-logs',
      'system.manage-settings',
      'system.view-analytics',
    ],
  },

  // ============================================
  // 👨‍💼 ADMIN (Administrador de Tenant)
  // ============================================
  {
    name: 'Administrador',
    slug: 'admin',
    description: 'Administrador de un tenant. Puede gestionar usuarios y configuración dentro de su tenant.',
    level: 50,
    color: '#2563EB', // Azul
    icon: 'shield',
    isSystemRole: true,
    permissionKeys: [
      // Usuarios dentro de su tenant
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'users.list',
      'users.block',
      'users.unblock',
      'users.view-sensitive',
      
      // Puede ver su tenant pero no modificar cosas críticas
      'tenants.read',
      'tenants.configure',
      
      // Puede ver roles pero no crear/eliminar roles del sistema
      'roles.read',
      'roles.list',
      
      // Puede ver permisos
      'permissions.read',
      'permissions.list',
      
      // Puede asignar usuarios a roles dentro de su tenant
      'user-tenant-roles.create',
      'user-tenant-roles.read',
      'user-tenant-roles.update',
      'user-tenant-roles.delete',
      'user-tenant-roles.list',
      'user-tenant-roles.manage-custom-permissions',
      
      // Analytics de su tenant
      'system.view-analytics',
    ],
  },

  // ============================================
  // ✏️ EDITOR
  // ============================================
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Puede crear y editar contenido y usuarios, pero no eliminar ni gestionar configuraciones críticas.',
    level: 25,
    color: '#16A34A', // Verde
    icon: 'pencil',
    isSystemRole: true,
    permissionKeys: [
      // Usuarios: crear y editar, pero no eliminar ni bloquear
      'users.create',
      'users.read',
      'users.update',
      'users.list',
      'users.view-sensitive',
      
      // Solo lectura de tenant
      'tenants.read',
      
      // Solo lectura de roles
      'roles.read',
      'roles.list',
      
      // Solo lectura de permisos
      'permissions.read',
      'permissions.list',
      
      // Puede ver asignaciones pero no modificar
      'user-tenant-roles.read',
      'user-tenant-roles.list',
    ],
  },
];