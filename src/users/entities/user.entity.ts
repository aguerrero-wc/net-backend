import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany 
} from 'typeorm';
import { UserTenantRole } from '../../user-tenant-roles/entities/user-tenant-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({unique: true})
  email: string;

  @Column({ select: false })
  password: string;

  // 🆕 CAMPO CRÍTICO PARA REFRESH TOKENS
  @Column({type: 'varchar', nullable: true, select: false })
  hashedRefreshToken: string | null;

  // Información adicional
  @Column({ nullable: true })
  avatar: string | null; // URL del avatar

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  timezone: string | null;

  @Column({ default: 'es' })
  language: string;

  // Configuración de usuario
  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any> | null; // Preferencias UI, notificaciones, etc.

  // Autenticación
  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string | null;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  twoFactorSecret: string | null;

  // Sesiones
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ nullable: true })
  lastLoginIp: string | null;

  // Estado
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  blockedReason: string | null;

  @OneToMany(() => UserTenantRole, utr => utr.user)
  tenantRoles: UserTenantRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}