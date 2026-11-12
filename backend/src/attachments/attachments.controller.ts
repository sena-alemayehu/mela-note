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
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { ATTACHMENT_UPLOAD_DIR } from './attachment-storage.service';

interface AuthenticatedRequest extends Request {
  user: { sub: string };
}

@Controller('attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('notes/:noteId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          mkdirSync(ATTACHMENT_UPLOAD_DIR, { recursive: true });
          callback(null, ATTACHMENT_UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname)
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, '');

          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024,
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

    return this.attachmentsService.upload(request.user.sub, noteId, file);
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

    return response.download(file.path, file.fileName);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.attachmentsService.remove(request.user.sub, id);
  }
}