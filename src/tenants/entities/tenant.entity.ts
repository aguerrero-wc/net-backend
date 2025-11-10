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
import { TenantContact } from './tenant-contact.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string; 

  @Column({ nullable: true })
  favicon: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ default: true })
  isActive: boolean;

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

  @OneToMany(() => TenantContact, contact => contact.tenant, { cascade: true })
  contacts: TenantContact[];
}