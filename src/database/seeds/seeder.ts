import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { PermissionsSeed } from './1-permissions.seed';
import { RolesSeed } from './2-roles.seed';
import { InitialSuperAdminSeed } from './3-initial-super-admin.seed';

config();

async function runSeeders() {
  const dbConfig = {
    type: 'postgres' as const,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  };

  console.log('🌱 Starting database seeding...\n');

  if (!dbConfig.host || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
    console.error('❌ Missing required environment variables!');
    process.exit(1);
  }

  const dataSource = new DataSource(dbConfig);

  try {
    await dataSource.initialize();
    console.log('✓ Database connection established\n');

    // 1. Permisos
    const permissionsSeed = new PermissionsSeed();
    await permissionsSeed.run(dataSource);

    // 2. Roles (con permisos asignados)
    const rolesSeed = new RolesSeed();
    await rolesSeed.run(dataSource);

    // 3. Super Admin Inicial
    const superAdminSeed = new InitialSuperAdminSeed();
    await superAdminSeed.run(dataSource);

    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('\n✓ Database connection closed');
  }
}

runSeeders();