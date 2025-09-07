import { Injectable } from '@nestjs/common';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileService {
  private readonly uploadPath = 'files';
  private readonly baseUrl = 'http://localhost:3000/files';

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdir(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; path: string }> {
    const { buffer, originalname } = file;
    const safeName = originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const filename = `${uuid()}-${safeName}`;
    const path = join(this.uploadPath, filename);

    await writeFile(path, buffer);
    return { url: `${this.baseUrl}/${filename}`, path };
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (err) {
      console.error(`Failed to delete file: ${path}`, err);
    }
  }
}
