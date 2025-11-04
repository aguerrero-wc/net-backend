import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  OneToOne, 
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_configurations')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Tenant, tenant => tenant.configuration, { onDelete: 'CASCADE' })
  @JoinColumn()
  tenant: Tenant;

  @Column({ type: 'uuid' })
  tenantId: string;

  // === CONFIGURACIÓN DE TEMA/UI ===
  @Column({ default: '#3B82F6' }) // Azul por defecto
  primaryColor: string;

  @Column({ default: '#10B981' }) // Verde por defecto
  secondaryColor: string;

  @Column({ default: '#EF4444' }) // Rojo por defecto
  accentColor: string;

  @Column({ default: 'light' })
  theme: string; // 'light', 'dark', 'auto'

  @Column({ default: 'modern' })
  uiStyle: string; // 'modern', 'classic', 'minimal'

  // === CONFIGURACIÓN DE LAYOUT ===
  @Column({ default: true })
  sidebarEnabled: boolean;

  @Column({ default: 'expanded' })
  sidebarDefaultState: string; // 'expanded', 'collapsed', 'auto'

  @Column({ default: true })
  breadcrumbsEnabled: boolean;

  @Column({ default: true })
  headerEnabled: boolean;

  @Column({ default: true })
  footerEnabled: boolean;

  // === CONFIGURACIÓN DE FUNCIONALIDADES ===
  @Column({ default: true })
  notificationsEnabled: boolean;

  @Column({ default: false })
  maintenanceMode: boolean;

  @Column({ nullable: true })
  maintenanceMessage: string;

  // === CONFIGURACIÓN DE AUTENTICACIÓN ===
  @Column({ default: false })
  ssoEnabled: boolean;

  @Column({ nullable: true })
  ssoProvider: string; // 'google', 'microsoft', 'okta', etc.

  @Column({ type: 'jsonb', nullable: true })
  ssoConfig: Record<string, any>;

  @Column({ default: false })
  twoFactorRequired: boolean;

  @Column({ default: 30 })
  sessionTimeoutMinutes: number;

  // === CONFIGURACIÓN DE EMAIL ===
  @Column({ nullable: true })
  emailFromName: string;

  @Column({ nullable: true })
  emailFromAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  emailTemplates: Record<string, any>; // Templates personalizados

  // === CONFIGURACIÓN DE INTEGRACIONES ===
  @Column({ type: 'jsonb', nullable: true })
  integrations: Record<string, any>; // APIs externas, webhooks, etc.

  // === CONFIGURACIÓN DE REPORTES ===
  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ default: 'es' })
  defaultLanguage: string;

  @Column({ type: 'jsonb', default: ['jpg', 'png', 'pdf', 'docx'] })
  allowedFileTypes: string[];

  // === CONFIGURACIÓN CUSTOM ===
  @Column({ type: 'jsonb', nullable: true })
  customSettings: Record<string, any>; // Configuraciones específicas del cliente

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}