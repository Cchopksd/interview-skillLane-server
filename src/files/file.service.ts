// files/file.service.ts
import { Injectable } from '@nestjs/common';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, extname, basename as pathBasename } from 'path';
import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private readonly uploadPath = 'files';
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = `http://localhost:${this.configService.get('PORT')}/files`;
  }

  private sanitizeName(name: string) {
    const ext = extname(name);
    const base = pathBasename(name, ext).replace(/[^a-z0-9-_]/gi, ''); // "cover"
    return `${base}-${Date.now()}${ext}`;
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; path: string }> {
    try {
      if (!existsSync(this.uploadPath)) {
        await mkdir(this.uploadPath, { recursive: true });
      }

      const safeName = this.sanitizeName(file.originalname);
      const path = join(this.uploadPath, safeName);
      await writeFile(path, file.buffer);

      return { url: `${this.baseUrl}/${safeName}`, path };
    } catch (err) {
      console.error(`Failed to upload file: ${file.originalname}`, err);
      throw err;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (err) {
      console.error(`Failed to delete file: ${path}`, err);
    }
  }
}
