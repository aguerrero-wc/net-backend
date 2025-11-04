import { 
  IsString, 
  IsBoolean, 
  IsOptional, 
  IsNumber, 
  IsObject,
  IsArray,
  Matches,
  Min,
  Max,
  IsIn
} from 'class-validator';

export class CreateTenantConfigurationDto {
  // === CONFIGURACIÓN DE TEMA/UI ===
  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color primario debe ser un código hexadecimal válido'
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color secundario debe ser un código hexadecimal válido'
  })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color de acento debe ser un código hexadecimal válido'
  })
  accentColor?: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'auto'])
  theme?: string;

  @IsOptional()
  @IsString()
  @IsIn(['modern', 'classic', 'minimal'])
  uiStyle?: string;

  // === CONFIGURACIÓN DE LAYOUT ===
  @IsOptional()
  @IsBoolean()
  sidebarEnabled?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['expanded', 'collapsed', 'auto'])
  sidebarDefaultState?: string;

  @IsOptional()
  @IsBoolean()
  breadcrumbsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  headerEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  footerEnabled?: boolean;

  // === CONFIGURACIÓN DE FUNCIONALIDADES ===
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  maintenanceMessage?: string;

  // === CONFIGURACIÓN DE AUTENTICACIÓN ===
  @IsOptional()
  @IsBoolean()
  ssoEnabled?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['google', 'microsoft', 'okta', 'auth0'])
  ssoProvider?: string;

  @IsOptional()
  @IsObject()
  ssoConfig?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  twoFactorRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(1440)
  sessionTimeoutMinutes?: number;

  // === CONFIGURACIÓN DE EMAIL ===
  @IsOptional()
  @IsString()
  emailFromName?: string;

  @IsOptional()
  @IsString()
  emailFromAddress?: string;

  @IsOptional()
  @IsObject()
  emailTemplates?: Record<string, any>;

  // === CONFIGURACIÓN DE INTEGRACIONES ===
  @IsOptional()
  @IsObject()
  integrations?: Record<string, any>;

  // === CONFIGURACIÓN DE REPORTES ===
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['es', 'en', 'pt', 'fr'])
  defaultLanguage?: string;

  @IsOptional()
  @IsArray()
  allowedFileTypes?: string[];

  // === CONFIGURACIÓN CUSTOM ===
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;
}