import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./tenant.entity";

// tenant-service-config.entity.ts
@Entity('tenant_service_configs')
export class TenantServiceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  serviceType: string; // 'meta', 'aws', 'digital_ocean', 'vimeo', etc.

  @Column({ type: 'jsonb' })
  credentials: Record<string, any>; // Encriptado

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // Configuraciones adicionales

  @Column({ default: true })
  isActive: boolean;

  // Relación con Tenant
  @ManyToOne(() => Tenant, tenant => tenant.serviceConfigs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}