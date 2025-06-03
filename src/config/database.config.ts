import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = async (config: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: config.get<string>('POSTGRES_HOST_DEV'),
  port: config.get<number>('POSTGRES_PORT_DEV'),
  username: config.get<string>('POSTGRES_USER_DEV'),
  password: config.get<string>('POSTGRES_PASSWORD_DEV'),
  database: config.get<string>('POSTGRES_DB_DEV'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Ruta dinámica para las entidades
  synchronize: config.get<string>('NODE_ENV_DEV') !== 'production',
  logging: config.get<string>('NODE_ENV_DEV') !== 'production',
});