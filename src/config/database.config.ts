import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = async (config: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: config.get<string>('DATABASE_HOST'),
  database: config.get<string>('DATABASE_NAME'),
  username: config.get<string>('DATABASE_USER'),
  password: config.get<string>('DATABASE_PASSWORD'),
  port: config.get<number>('DATABASE_PORT'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Ruta dinámica para las entidades
  synchronize: config.get<string>('NODE_ENV_DEV') !== 'production',
  logging: config.get<string>('NODE_ENV_DEV') !== 'production',
});