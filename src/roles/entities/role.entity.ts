// src/entities/role.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string; // 'super-admin', 'tenant-admin', 'editor', 'viewer'

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  color: string; // Color para badges/chips

  @Column({ nullable: true })
  icon: string; // Icono para UI

  // Permisos granulares
  @Column({ type: 'jsonb', default: [] })
  permissions: string[]; // ['users.create', 'users.read', 'users.update', 'users.delete']

  // Nivel de acceso (para jerarquía)
  @Column({ default: 0 })
  level: number; // 0=viewer, 50=editor, 90=admin, 100=super-admin

  // Meta información
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemRole: boolean; // No se puede eliminar

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}