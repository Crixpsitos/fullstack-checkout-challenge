import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  IStorageService,
  StorageFileInput,
} from '../../../../shared/storage/storage.service.port';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly baseDir = join(process.cwd(), 'public');

  async saveMany(files: StorageFileInput[], folder: string): Promise<string[]> {
    const uploadPath = join(this.baseDir, 'uploads', folder);
    await mkdir(uploadPath, { recursive: true });

    return Promise.all(
      files.map(async (file) => {
        const ext = file.originalname.split('.').pop() || 'bin';
        const filename = `${uuidv4()}.${ext}`;
        await writeFile(join(uploadPath, filename), file.buffer);
        return `/uploads/${folder}/${filename}`;
      }),
    );
  }

  async deleteMany(urls: string[]): Promise<void> {
    await Promise.all(
      urls
        .filter((url) => this.isLocalUrl(url))
        .map((url) => unlink(join(this.baseDir, url)).catch(() => undefined)),
    );
  }

  isLocalUrl(url: string): boolean {
    return url.startsWith('/uploads/');
  }
}
