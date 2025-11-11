// src/config/encryption.config.ts
import { ConfigService } from '@nestjs/config';

export interface EncryptionConfig {
  algorithm: string;
  key: Buffer;
  iv: Buffer;
}

export const getEncryptionConfig = (config: ConfigService): EncryptionConfig => {
  const key = config.get<string>('ENCRYPTION_KEY');
  const iv = config.get<string>('ENCRYPTION_IV');

  if (!key || !iv) {
    throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV must be defined in environment variables');
  }

  // Validar que las keys tengan el tamaño correcto
  if (key.length !== 64) { // 32 bytes en hex = 64 caracteres
    throw new Error('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
  }

  if (iv.length !== 32) { // 16 bytes en hex = 32 caracteres
    throw new Error('ENCRYPTION_IV must be 32 hexadecimal characters (16 bytes)');
  }

  return {
    algorithm: 'aes-256-cbc',
    key: Buffer.from(key, 'hex'),
    iv: Buffer.from(iv, 'hex'),
  };
};