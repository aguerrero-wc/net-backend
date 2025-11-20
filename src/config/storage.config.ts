import { ConfigService } from '@nestjs/config';

export interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  cdnUrl?: string;
}

export const getStorageConfig = (
  configService: ConfigService,
): StorageConfig => {
    const provider = configService.get<string>('STORAGE_PROVIDER', 'digitalocean');
    
    // Configuración base
    const config: StorageConfig = {
        endpoint: configService.get<string>('DO_SPACES_ENDPOINT', ''),
        region: configService.get<string>('DO_SPACES_REGION', ''),
        accessKeyId: configService.get<string>('DO_SPACES_KEY_ID', ''),
        secretAccessKey: configService.get<string>('DO_SPACES_SECRET', ''),
        bucket: configService.get<string>('DO_SPACES_BUCKET', ''),
        cdnUrl: configService.get<string>('DO_SPACES_CDN_URL', ''),
    };

    // Validar que existan las variables críticas
    if (!config.accessKeyId) {
        throw new Error(
        'DO_SPACES_KEY is not defined. Please add it to your .env file',
        );
    }

    if (!config.secretAccessKey) {
        throw new Error(
        'DO_SPACES_SECRET is not defined. Please add it to your .env file',
        );
    }

    if (!config.bucket) {
        throw new Error(
        'DO_SPACES_BUCKET is not defined. Please add it to your .env file',
        );
    }

    return config;
};

// Configuraciones específicas por proveedor
export const getDigitalOceanConfig = (
  configService: ConfigService,
): StorageConfig => ({
  endpoint: configService.get<string>(
    'DO_SPACES_ENDPOINT',
    'https://sfo3.digitaloceanspaces.com',
  ),
  region: configService.get<string>('DO_SPACES_REGION', 'sfo3'),
  accessKeyId: configService.get<string>('DO_SPACES_KEY_ID', ''),
  secretAccessKey: configService.get<string>('DO_SPACES_SECRET', ''),
  bucket: configService.get<string>('DO_SPACES_BUCKET', ''),
  cdnUrl: configService.get<string | undefined>('DO_SPACES_CDN_URL'), // https://your-space.nyc3.cdn.digitaloceanspaces.com
});

// Preparado para otros CDN
// export const getAWSS3Config = (configService: ConfigService): StorageConfig => ({
//   endpoint: undefined, // AWS S3 usa endpoint por defecto
//   region: configService.get<string>('AWS_REGION', 'us-east-1'),
//   accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
//   secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
//   bucket: configService.get<string>('AWS_S3_BUCKET'),
//   cdnUrl: configService.get<string>('AWS_CLOUDFRONT_URL'),
// });