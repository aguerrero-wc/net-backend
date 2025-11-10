// src/tenants/entities/tenant-contact.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum ContactType {
  SISTEMAS = 'sistemas',
  COMUNICACIONES = 'comunicaciones',
  VENTAS = 'ventas',
  SOPORTE = 'soporte',
  ADMINISTRATIVO = 'administrativo',
  FACTURACION = 'facturacion',
  GENERAL = 'general',
}

@Entity('tenant_contacts')
export class TenantContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContactType,
  })
  type: ContactType;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string; // Cargo: "Jefe de Sistemas", "Gerente de IT"

  @Column({ nullable: true })
  department: string;

  @Column({ default: true })
  isPrimary: boolean; // Contacto principal por tipo

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relación con Tenant
  @ManyToOne(() => Tenant, tenant => tenant.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}