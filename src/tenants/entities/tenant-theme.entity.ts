// src/entities/tenant-theme.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tenant_themes')
export class TenantTheme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'Corporate Blue', 'Nature Green', 'Sunset Orange'

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  preview: string; // URL de imagen preview

  @Column()
  primaryColor: string;

  @Column()
  secondaryColor: string;

  @Column()
  accentColor: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalStyles: Record<string, any>; // CSS custom, fuentes, etc.

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPremium: boolean; // Solo para planes premium

  @CreateDateColumn()
  createdAt: Date;
}