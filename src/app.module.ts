import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { TenantsModule } from './tenants/tenants.module';
import { UserTenantRolesModule } from './user-tenant-roles/user-tenant-roles.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DATABASE_HOST || 'localhost',
    //   port: parseInt(process.env.DATABASE_PORT ?? '5411', 10),
    //   database: process.env.DATABASE_NAME || 'net_db',
    //   username: process.env.DATABASE_USER || 'postgres',
    //   password: process.env.DATABASE_PASSWORD || 'postgres',
    //   entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Ruta dinámica para las entidades
    //   synchronize: true,
    // }),

    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig, // 👈 Usa la función factory
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    TenantsModule,
    UserTenantRolesModule,
  ],
})
export class AppModule {}
