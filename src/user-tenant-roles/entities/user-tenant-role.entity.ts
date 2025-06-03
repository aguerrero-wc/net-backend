// src/entities/user-tenant-role.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  Unique 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('user_tenant_roles')
@Unique(['userId', 'tenantId']) // Un usuario solo puede tener UN rol por tenant
export class UserTenantRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === RELACIONES ===
  
  // Relación con Usuario
  @ManyToOne(() => User, user => user.tenantRoles, { 
    onDelete: 'CASCADE',
    eager: false 
  })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // Relación con Tenant  
  @ManyToOne(() => Tenant, tenant => tenant.userRoles, { 
    onDelete: 'CASCADE',
    eager: false 
  })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  tenantId: string;

  // Relación con Rol Global
  @ManyToOne(() => Role, { 
    eager: true // Siempre cargar el rol cuando se consulte
  })
  role: Role;

  @Column({ type: 'uuid' })
  roleId: string;

  // === PERMISOS ESPECÍFICOS ===
  
  // Permisos ADICIONALES específicos para este tenant
  // Estos se SUMAN a los permisos base del rol
  @Column({ type: 'jsonb', nullable: true })
  additionalPermissions: string[];

  // Permisos DENEGADOS específicos para este tenant  
  // Estos se QUITAN de los permisos base del rol
  @Column({ type: 'jsonb', nullable: true })
  deniedPermissions: string[];

  // === CONFIGURACIÓN ===
  
  // Estado de la asignación
  @Column({ default: true })
  isActive: boolean;

  // Fecha de inicio del rol (opcional)
  @Column({ type: 'timestamp', nullable: true })
  startsAt: Date;

  // Fecha de fin del rol (opcional - para roles temporales)
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  // Quien asignó este rol
  @Column({ type: 'uuid', nullable: true })
  assignedBy: string;

  // Notas sobre la asignación
  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // === COMPUTED PROPERTIES ===

  // Verificar si el rol está vigente
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Verificar si el rol ya comenzó
  get hasStarted(): boolean {
    if (!this.startsAt) return true;
    return new Date() >= this.startsAt;
  }

  // Verificar si el rol está activo y vigente
  get isCurrentlyActive(): boolean {
    return this.isActive && this.hasStarted && !this.isExpired;
  }
}