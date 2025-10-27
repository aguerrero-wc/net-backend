import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { rolesData } from './data/roles.data';

export class RolesSeed {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    console.log('🎭 Seeding roles...');

    for (const roleData of rolesData) {
      // Verificar si ya existe
      let role = await roleRepository.findOne({
        where: { slug: roleData.slug },
        relations: ['permissions'],
      });

      // Buscar los permisos por sus keys
      const permissions = await permissionRepository
        .createQueryBuilder('permission')
        .where('permission.key IN (:...keys)', { keys: roleData.permissionKeys })
        .getMany();

      if (!role) {
        // Crear nuevo rol
        role = roleRepository.create({
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          level: roleData.level,
          color: roleData.color,
          icon: roleData.icon,
          isSystemRole: roleData.isSystemRole,
          permissions: permissions,
        });
        await roleRepository.save(role);
        console.log(`   ✓ Created role: ${roleData.name} (${permissions.length} permissions)`);
      } else {
        // Actualizar permisos del rol existente
        role.permissions = permissions;
        await roleRepository.save(role);
        console.log(`   ⊚ Role already exists: ${roleData.name} (updated permissions)`);
      }
    }

    console.log(`✅ Roles seed completed! (${rolesData.length} roles)\n`);
  }
}