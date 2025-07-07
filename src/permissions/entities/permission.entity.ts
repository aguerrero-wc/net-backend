import { Role } from '../../roles/entities/role.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({
    unique: true,
    length: 100,
    comment: 'Clave única del permiso, ej: "users.create"',
  })
  key: string;

  @Column({
    length: 255,
    comment: 'Descripción legible por humanos, ej: "Crear usuarios"',
  })
  description: string;

  @Column({
    length: 50,
    comment: 'Agrupador para la UI, ej: "Usuarios"',
  })
  group: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}