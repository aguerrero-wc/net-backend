import { Permission } from 'src/permissions/entities/permission.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';

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

  // Nivel de acceso (para jerarquía)
  @Column({ default: 0 })
  level: number;

  // Meta información
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemRole: boolean; // No se puede eliminar

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Permission, {
    cascade: true,
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}