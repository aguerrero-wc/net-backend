// src/common/services/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CommonService {
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Usar el helper de config
    const encryptionConfig = this.getEncryptionConfig();
    this.algorithm = encryptionConfig.algorithm;
    this.key = encryptionConfig.key;
    this.iv = encryptionConfig.iv;
  }

  private getEncryptionConfig() {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    const iv = this.configService.get<string>('ENCRYPTION_IV');

    if (!key || !iv) {
      throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV must be defined');
    }

    return {
      algorithm: 'aes-256-cbc',
      key: Buffer.from(key, 'hex'),
      iv: Buffer.from(iv, 'hex'),
    };
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  encryptObject(obj: Record<string, any>): Record<string, any> {
    const encrypted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        encrypted[key] = this.encrypt(String(value));
      }
    }
    return encrypted;
  }

  decryptObject(obj: Record<string, any>): Record<string, any> {
    const decrypted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        try {
          decrypted[key] = this.decrypt(String(value));
        } catch (error) {
          // Si falla la desencriptación, devolver el valor original
          // (útil para migración de datos viejos)
          decrypted[key] = value;
        }
      }
    }
    return decrypted;
  }
}