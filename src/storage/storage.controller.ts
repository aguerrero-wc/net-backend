import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storage')
// @UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('health')
  async health() {
    const storageHealth = await this.storageService.testConnection();
    return {
      status: storageHealth.status === 'healthy' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        storage: storageHealth,
      },
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.storageService.uploadFile(file, 'uploads', true);

    return {
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // máximo 10 archivos
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await this.storageService.uploadFiles(
      files,
      'uploads',
      true,
    );

    return {
      message: 'Files uploaded successfully',
      data: results,
    };
  }


}