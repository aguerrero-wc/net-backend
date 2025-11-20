import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getStorageConfig } from '../config/storage.config';
import { Readable } from 'stream';

// No necesitas importar Multer aquí, los tipos son globales con @types/multer

export interface UploadResult {
  url: string;
  cdnUrl?: string;
  key: string;
  bucket: string;
  size: number;
  mimetype: string;
}

export interface StorageHealthCheck {
  status: 'healthy' | 'unhealthy';
  provider: string;
  bucket: string;
  endpoint: string;
  cdnConfigured: boolean;
  cdnUrl?: string;
  latency?: number;
  error?: string;
  timestamp: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly config: ReturnType<typeof getStorageConfig>;

  constructor(private configService: ConfigService) {
    this.config = getStorageConfig(configService);

    this.s3Client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: true, // DigitalOcean usa virtual-hosted-style
    });

    this.logger.log(
      `Storage service initialized with endpoint: ${this.config.endpoint}`,
    );
  }

  async testConnection(): Promise<StorageHealthCheck> {
    const startTime = Date.now();
    
    try {
      const command = new HeadBucketCommand({
        Bucket: this.config.bucket,
      });

      await this.s3Client.send(command);
      
      const latency = Date.now() - startTime;

      this.logger.log(`Storage connection test successful (${latency}ms)`);

      return {
        status: 'healthy',
        provider: 'DigitalOcean Spaces',
        bucket: this.config.bucket,
        endpoint: this.config.endpoint,
        cdnConfigured: !!this.config.cdnUrl,
        cdnUrl: this.config.cdnUrl,
        latency,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Storage connection test failed: ${error.message}`,
        error.stack,
      );

      return {
        status: 'unhealthy',
        provider: 'DigitalOcean Spaces',
        bucket: this.config.bucket,
        endpoint: this.config.endpoint,
        cdnConfigured: !!this.config.cdnUrl,
        cdnUrl: this.config.cdnUrl,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Sube un archivo a DigitalOcean Spaces
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    isPublic: boolean = true,
  ): Promise<UploadResult> {
    try {
      // Generar nombre único
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${folder}/${timestamp}-${sanitizedName}`;

      // Configurar el upload
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.config.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: isPublic ? 'public-read' : 'private',
          Metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Ejecutar upload
      await upload.done();

      const baseUrl = this.config.endpoint.replace('https://', '');
      const regularUrl = `https://${this.config.bucket}.${baseUrl}/${key}`;
      const cdnUrl = this.config.cdnUrl
        ? `${this.config.cdnUrl}/${key}`
        : regularUrl;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        url: regularUrl,
        cdnUrl,
        key,
        bucket: this.config.bucket,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sube múltiples archivos
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
    isPublic: boolean = true,
  ): Promise<UploadResult[]> {
    return Promise.all(
      files.map((file) => this.uploadFile(file, folder, isPublic)),
    );
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene la URL CDN de un archivo
   */
  getCdnUrl(key: string): string {
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl}/${key}`;
    }
    const baseUrl = this.config.endpoint.replace('https://', '');
    return `https://${this.config.bucket}.${baseUrl}/${key}`;
  }

  /**
   * Verifica si un archivo existe
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || (error as any).$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Descarga un archivo
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(
        `Error downloading file: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}