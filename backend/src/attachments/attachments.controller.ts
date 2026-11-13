import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Response } from 'express';

import { JwtAuthGuard, AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { ATTACHMENT_UPLOAD_DIR } from './attachment-storage.service';

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.txt', '.csv', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.mp3', '.wav', '.ogg', '.m4a', '.webm',
]);

const ALLOWED_MIME_PREFIXES = [
  'image/',
  'audio/',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-',
];

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('notes/:noteId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          mkdir(ATTACHMENT_UPLOAD_DIR, { recursive: true })
            .then(() => callback(null, ATTACHMENT_UPLOAD_DIR))
            .catch((error: Error) =>
              callback(error, ATTACHMENT_UPLOAD_DIR),
            );
        },
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname)
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, '');

          // Generate random unique storage name (Task 6)
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB max size (Task 6)
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();

        // Check extension against whitelist
        if (!ALLOWED_EXTENSIONS.has(extension)) {
          return callback(
            new BadRequestException(
              `File type not allowed. Supported formats: images, documents (PDF, DOCX, XLSX, TXT, CSV), and audio.`,
            ),
            false,
          );
        }

        // Check MIME type prefix
        const isMimeAllowed = ALLOWED_MIME_PREFIXES.some((prefix) =>
          file.mimetype.toLowerCase().startsWith(prefix),
        );

        if (!isMimeAllowed) {
          return callback(
            new BadRequestException(`Unsupported file MIME type: ${file.mimetype}`),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @Param('noteId') noteId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Please select a file. Maximum file size is 25 MB.',
      );
    }

    return this.attachmentsService.upload(
      request.user.sub,
      noteId,
      file,
      {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.attachmentsService.findAll(request.user.sub);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const file = await this.attachmentsService.getDownloadFile(
      request.user.sub,
      id,
    );

    // Set secure download headers to protect against XSS and MIME sniffing (Task 6 & 7)
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'");
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    );

    return response.download(file.path, file.fileName);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.attachmentsService.remove(request.user.sub, id, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }
}
