import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';

export const ATTACHMENT_UPLOAD_DIR = join(
  process.cwd(),
  'uploads',
  'attachments',
);

@Injectable()
export class AttachmentStorageService {
  async ensureUploadDirectory(): Promise<void> {
    await mkdir(ATTACHMENT_UPLOAD_DIR, { recursive: true });
  }

  getFilePath(storageKey: string): string {
    return join(ATTACHMENT_UPLOAD_DIR, storageKey);
  }

  fileExists(storageKey: string): boolean {
    return existsSync(this.getFilePath(storageKey));
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      await unlink(this.getFilePath(storageKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
