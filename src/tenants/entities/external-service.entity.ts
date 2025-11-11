// src/tenants/entities/external-service.entity.ts
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from './tenant.entity';
import { ServiceType } from '../dto/external-service.dto';

@Entity('tenant_external_services')
export class TenantExternalService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ServiceType
  })
  serviceType: ServiceType;

  @Column('jsonb') // PostgreSQL
  // @Column('json') // MySQL
  credentials: Record<string, any>; // Aquí se guardan las credenciales ENCRIPTADAS

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Tenant, tenant => tenant.externalServices, {
    onDelete: 'CASCADE'
  })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}