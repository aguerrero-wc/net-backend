import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { TenantServiceConfig } from './tenant-service-config.entity';


@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string; // client-1, mi-empresa, etc. (URL friendly)

  @Column({ unique: true })
  domain: string; // client1.tudominio.com

  @Column({ nullable: true })
  customDomain: string; // www.clienteempresa.com (opcional)

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string; // URL del logo

  @Column({ nullable: true })
  favicon: string; // URL del favicon

  // Información de contacto
  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  // Plan/Suscripción
  @Column({ default: 'free' })
  plan: string; // 'free', 'basic', 'premium', 'enterprise'

  @Column({ type: 'timestamp', nullable: true })
  planExpiresAt: Date;

  // Límites según el plan
  @Column({ default: 10 })
  maxUsers: number;

  @Column({ default: 1000 })
  maxStorage: number; // MB

  // Estado
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ nullable: true })
  suspendedReason: string;

  // Configuración básica (puede ir aquí o en tabla separada)
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Datos extra flexibles

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  // Relaciones
  @OneToMany(() => UserTenantRole, utr => utr.tenant, { cascade: true })
  userRoles: UserTenantRole[];

  @OneToOne(() => TenantConfiguration, config => config.tenant, { cascade: true })
  configuration: TenantConfiguration;

  @OneToMany(() => TenantServiceConfig, serviceConfig => serviceConfig.tenant, { cascade: true })
  serviceConfigs: TenantServiceConfig[];
  
}