import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Permission } from '../../permissions/entities/permission.entity';
import { permissionsData } from './data/permissions.data';

config(); // Cargar variables de entorno

export class PermissionsSeed {
  async run(dataSource: DataSource): Promise<void> {
    const permissionRepository = dataSource.getRepository(Permission);

    console.log('🔐 Seeding permissions...');

    for (const permData of permissionsData) {
      const existingPermission = await permissionRepository.findOne({
        where: { key: permData.key },
      });

      if (!existingPermission) {
        const permission = permissionRepository.create(permData);
        await permissionRepository.save(permission);
        console.log(`   ✓ Created permission: ${permData.key}`);
      } else {
        console.log(`   ⊚ Permission already exists: ${permData.key}`);
      }
    }

    console.log(`✅ Permissions seed completed! (${permissionsData.length} permissions)\n`);
  }
}

// ⬇️ AGREGAR ESTO: Código para ejecutar cuando se llama directamente
if (require.main === module) {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  dataSource
    .initialize()
    .then(async () => {
      console.log('✓ Database connection established\n');
      const seed = new PermissionsSeed();
      await seed.run(dataSource);
      await dataSource.destroy();
      console.log('✓ Database connection closed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}