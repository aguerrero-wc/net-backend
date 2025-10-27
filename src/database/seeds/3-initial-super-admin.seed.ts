import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';
import * as bcrypt from 'bcrypt';

export class InitialSuperAdminSeed {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const tenantRepository = dataSource.getRepository(Tenant);
    const userTenantRoleRepository = dataSource.getRepository(UserTenantRole);

    console.log('👑 Creating initial super admin...');

    // Leer credenciales desde variables de entorno
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@channel.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';
    const superAdminFirstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
    const superAdminLastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';

    // Validación
    if (!superAdminEmail || !superAdminPassword) {
      console.error('   ❌ SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
      return;
    }

    // 1. Verificar si ya existe el super admin
    const existingUser = await userRepository.findOne({
      where: { email: superAdminEmail },
    });

    if (existingUser) {
      console.log(`   ⊚ Super admin already exists: ${superAdminEmail}`);
      console.log('✅ Initial super admin seed completed!\n');
      return;
    }

    // 2. Buscar o crear el tenant principal
    // Buscar primero por slug, luego por dominio, o usar el primero disponible
    let mainTenant = await tenantRepository.findOne({
      where: { slug: 'system' },
    });

    if (!mainTenant) {
      // Si no existe con slug "system", buscar por dominio
      mainTenant = await tenantRepository.findOne({
        where: { domain: 'windowschannel.us' },
      });
    }

    if (!mainTenant) {
      // Si tampoco existe, intentar obtener el primer tenant disponible
      const tenants = await tenantRepository.find({
        order: { createdAt: 'ASC' },
        take: 1,
      });
      mainTenant = tenants[0] || null;
    }

    if (!mainTenant) {
      // Solo si no hay ningún tenant, crear uno nuevo con dominio único
      const timestamp = Date.now();
      mainTenant = tenantRepository.create({
        name: 'Sistema',
        slug: 'system',
        domain: `system-${timestamp}.channel.com`, // Dominio único con timestamp
        description: 'Tenant del sistema para super administradores',
        plan: 'enterprise',
        maxUsers: 999,
        maxStorage: 999999,
        isActive: true,
      });
      await tenantRepository.save(mainTenant);
      console.log(`   ✓ Created system tenant with domain: system-${timestamp}.channel.com`);
    } else {
      console.log(`   ⊚ Using existing tenant: ${mainTenant.name} (${mainTenant.domain})`);
    }

    // 3. Crear el usuario super admin
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    
    const superAdmin = userRepository.create({
      firstName: superAdminFirstName,
      lastName: superAdminLastName,
      email: superAdminEmail,
      password: hashedPassword,
      emailVerified: true,
      isActive: true,
      language: 'es',
    });
    
    await userRepository.save(superAdmin);
    console.log('   ✓ Created super admin user');

    // 4. Buscar el rol de super-admin
    const superAdminRole = await roleRepository.findOne({
      where: { slug: 'super-admin' },
      relations: ['permissions'],
    });

    if (!superAdminRole) {
      console.error('   ❌ Super admin role not found! Run permissions and roles seeds first.');
      return;
    }

    console.log(`   ✓ Found super-admin role with ${superAdminRole.permissions.length} permissions`);

    // 5. Asignar el rol al usuario en el tenant
    const userTenantRole = userTenantRoleRepository.create({
      userId: superAdmin.id,
      tenantId: mainTenant.id,
      roleId: superAdminRole.id,
      isActive: true,
      assignedBy: superAdmin.id, // Se auto-asignó
      notes: 'Initial super admin created by seed',
    });
    
    await userTenantRoleRepository.save(userTenantRole);
    console.log('   ✓ Assigned super-admin role to user');

    console.log('✅ Initial super admin seed completed!\n');
    console.log('═══════════════════════════════════════');
    console.log(`  📧 Email: ${superAdminEmail}`);
    console.log(`  👤 Name: ${superAdminFirstName} ${superAdminLastName}`);
    console.log('  🔑 Password: ********');
    console.log(`  🏢 Tenant: ${mainTenant.name} (${mainTenant.slug})`);
    console.log('  👑 Role: Super Administrador');
    console.log('═══════════════════════════════════════');
    console.log('⚠️  IMPORTANTE: Guarda estas credenciales de forma segura!\n');
  }
}