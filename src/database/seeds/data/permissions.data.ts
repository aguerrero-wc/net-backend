export interface PermissionData {
  key: string;
  description: string;
  group: string;
}

export const permissionsData: PermissionData[] = [
  // ============================================
  // 👥 USERS
  // ============================================
  {
    key: 'users.create',
    description: 'Crear nuevos usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.read',
    description: 'Ver información de usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.update',
    description: 'Actualizar información de usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.delete',
    description: 'Eliminar usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.list',
    description: 'Listar todos los usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.block',
    description: 'Bloquear usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.unblock',
    description: 'Desbloquear usuarios',
    group: 'Usuarios',
  },
  {
    key: 'users.view-sensitive',
    description: 'Ver información sensible de usuarios (email, teléfono)',
    group: 'Usuarios',
  },

  // ============================================
  // 🏢 TENANTS
  // ============================================
  {
    key: 'tenants.create',
    description: 'Crear nuevos tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.read',
    description: 'Ver información de tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.update',
    description: 'Actualizar información de tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.delete',
    description: 'Eliminar tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.list',
    description: 'Listar todos los tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.suspend',
    description: 'Suspender tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.activate',
    description: 'Activar tenants suspendidos',
    group: 'Tenants',
  },
  {
    key: 'tenants.configure',
    description: 'Configurar ajustes de tenants',
    group: 'Tenants',
  },
  {
    key: 'tenants.manage-plan',
    description: 'Gestionar planes y suscripciones de tenants',
    group: 'Tenants',
  },

  // ============================================
  // 🎭 ROLES
  // ============================================
  {
    key: 'roles.create',
    description: 'Crear nuevos roles',
    group: 'Roles',
  },
  {
    key: 'roles.read',
    description: 'Ver información de roles',
    group: 'Roles',
  },
  {
    key: 'roles.update',
    description: 'Actualizar roles',
    group: 'Roles',
  },
  {
    key: 'roles.delete',
    description: 'Eliminar roles',
    group: 'Roles',
  },
  {
    key: 'roles.list',
    description: 'Listar todos los roles',
    group: 'Roles',
  },
  {
    key: 'roles.assign-permissions',
    description: 'Asignar permisos a roles',
    group: 'Roles',
  },

  // ============================================
  // 🔐 PERMISSIONS
  // ============================================
  {
    key: 'permissions.create',
    description: 'Crear nuevos permisos',
    group: 'Permisos',
  },
  {
    key: 'permissions.read',
    description: 'Ver permisos',
    group: 'Permisos',
  },
  {
    key: 'permissions.update',
    description: 'Actualizar permisos',
    group: 'Permisos',
  },
  {
    key: 'permissions.delete',
    description: 'Eliminar permisos',
    group: 'Permisos',
  },
  {
    key: 'permissions.list',
    description: 'Listar todos los permisos',
    group: 'Permisos',
  },

  // ============================================
  // 👤🏢 USER TENANT ROLES
  // ============================================
  {
    key: 'user-tenant-roles.create',
    description: 'Asignar usuarios a tenants con roles',
    group: 'Asignación de Roles',
  },
  {
    key: 'user-tenant-roles.read',
    description: 'Ver asignaciones de usuarios a tenants',
    group: 'Asignación de Roles',
  },
  {
    key: 'user-tenant-roles.update',
    description: 'Actualizar asignaciones de roles',
    group: 'Asignación de Roles',
  },
  {
    key: 'user-tenant-roles.delete',
    description: 'Eliminar asignaciones de roles',
    group: 'Asignación de Roles',
  },
  {
    key: 'user-tenant-roles.list',
    description: 'Listar asignaciones de roles',
    group: 'Asignación de Roles',
  },
  {
    key: 'user-tenant-roles.manage-custom-permissions',
    description: 'Gestionar permisos adicionales/denegados por tenant',
    group: 'Asignación de Roles',
  },

  // ============================================
  // ⚙️ SYSTEM / CONFIGURACIÓN
  // ============================================
  {
    key: 'system.view-logs',
    description: 'Ver logs del sistema',
    group: 'Sistema',
  },
  {
    key: 'system.manage-settings',
    description: 'Gestionar configuración del sistema',
    group: 'Sistema',
  },
  {
    key: 'system.view-analytics',
    description: 'Ver analytics y métricas',
    group: 'Sistema',
  },
];