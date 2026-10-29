
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { NoteType } from '../generated/prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email?: string;
  };
}

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    if (typeof body.content !== 'string') {
      throw new BadRequestException('Content must be a string.');
    }

    this.validateOptionalFields(body, true);

    return this.notesService.create(req.user.sub, {
      title: body.title as string | undefined,
      content: body.content,
      type: body.type as NoteType | undefined,
      color: body.color as string | undefined,
      isPinned: body.isPinned as boolean | undefined,
      labels: body.labels as string[] | undefined,
      checklist: body.checklist,
    });
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.notesService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.validateOptionalFields(body, false);

    return this.notesService.update(req.user.sub, id, {
      title: body.title as string | undefined,
      content: body.content as string | undefined,
      color: body.color as string | undefined,
      isPinned: body.isPinned as boolean | undefined,
      labels: body.labels as string[] | undefined,
      checklist: body.checklist,
    });
  }

  @Patch(':id/trash')
  trash(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.trash(req.user.sub, id);
  }

  @Patch(':id/archive')
  archive(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.archive(req.user.sub, id);
  }

  @Patch(':id/restore')
  restore(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.restore(req.user.sub, id);
  }

  @Delete(':id/permanent')
  permanentlyDelete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notesService.permanentlyDelete(req.user.sub, id);
  }

  private validateOptionalFields(
    body: Record<string, unknown>,
    creating: boolean,
  ) {
    if (
      body.title !== undefined &&
      (typeof body.title !== 'string' || body.title.length > 255)
    ) {
      throw new BadRequestException(
        'Title must be a string of at most 255 characters.',
      );
    }

    if (
      body.content !== undefined &&
      typeof body.content !== 'string'
    ) {
      throw new BadRequestException('Content must be a string.');
    }

    if (
      creating &&
      typeof body.content !== 'string'
    ) {
      throw new BadRequestException('Content is required.');
    }

    if (
      body.type !== undefined &&
      !Object.values(NoteType).includes(body.type as NoteType)
    ) {
      throw new BadRequestException(
        'Type must be TEXT or CHECKLIST.',
      );
    }

    if (
      body.color !== undefined &&
      (typeof body.color !== 'string' || body.color.length > 20)
    ) {
      throw new BadRequestException(
        'Color must be a string of at most 20 characters.',
      );
    }

    if (
      body.isPinned !== undefined &&
      typeof body.isPinned !== 'boolean'
    ) {
      throw new BadRequestException('isPinned must be a boolean.');
    }

    if (
      body.labels !== undefined &&
      (!Array.isArray(body.labels) ||
        !body.labels.every((label) => typeof label === 'string'))
    ) {
      throw new BadRequestException(
        'Labels must be an array of strings.',
      );
    }
  }
}
