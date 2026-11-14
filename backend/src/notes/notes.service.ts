import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NoteStatus, NoteType } from '../generated/prisma/client';
import { AttachmentStorageService } from '../attachments/attachment-storage.service';
import { AuditLogService } from '../audit/audit-log.service';

export interface FindAllNotesQuery {
  status?: NoteStatus;
  search?: string;
  label?: string;
  type?: NoteType;
}

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: AttachmentStorageService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(
    userId: string,
    data: {
      title?: string;
      content: string;
      type?: NoteType;
      color?: string;
      isPinned?: boolean;
      isFavorite?: boolean;
      labels?: string[];
      checklist?: unknown;
    },
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const note = await this.prisma.note.create({
      data: {
        title: data.title ?? '',
        content: data.content,
        type: data.type ?? NoteType.TEXT,
        color: data.color ?? '#FFFFFF',
        isPinned: data.isPinned ?? false,
        isFavorite: data.isFavorite ?? false,
        labels: data.labels as any,
        checklist: data.checklist as any,
        userId,
      },
      include: { attachments: true },
    });

    await this.auditLog.logAction({
      userId,
      action: 'NOTE_CREATE',
      details: { noteId: note.id, type: note.type },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return note;
  }

  async findAll(
    userId: string,
    query: FindAllNotesQuery = {},
  ) {
    const status = query.status ?? NoteStatus.ACTIVE;
    const where: Record<string, unknown> = {
      userId,
      status,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const notes = await this.prisma.note.findMany({
      where: where as any,
      include: {
        attachments: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // If label filter is requested, filter in memory or json
    if (query.label && query.label.trim()) {
      const targetLabel = query.label.trim().toLowerCase();
      return notes.filter((note) => {
        if (!Array.isArray(note.labels)) return false;
        return (note.labels as string[]).some(
          (l) => typeof l === 'string' && l.toLowerCase() === targetLabel,
        );
      });
    }

    return notes;
  }

  async findFavorites(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        status: NoteStatus.ACTIVE,
        isFavorite: true,
      },
      include: {
        attachments: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
      include: { attachments: true },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(
    userId: string,
    id: string,
    data: {
      title?: string;
      content?: string;
      type?: NoteType;
      color?: string;
      isPinned?: boolean;
      isFavorite?: boolean;
      labels?: string[];
      checklist?: unknown;
    },
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const result = await this.prisma.note.updateMany({
      where: { id, userId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
        ...(data.isFavorite !== undefined && {
          isFavorite: data.isFavorite,
        }),
        ...(data.labels !== undefined && { labels: data.labels as any }),
        ...(data.checklist !== undefined && {
          checklist: data.checklist as any,
        }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Note not found');
    }

    await this.auditLog.logAction({
      userId,
      action: 'NOTE_UPDATE',
      details: { noteId: id },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return this.findOne(userId, id);
  }

  async trash(userId: string, id: string, meta?: { ipAddress?: string; userAgent?: string }) {
    const result = await this.prisma.note.updateMany({
      where: { id, userId },
      data: {
        status: NoteStatus.TRASHED,
        trashedAt: new Date(),
        archivedAt: null,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Note not found');
    }

    await this.auditLog.logAction({
      userId,
      action: 'NOTE_TRASH',
      details: { noteId: id },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: 'Note moved to Trash' };
  }

  async archive(userId: string, id: string, meta?: { ipAddress?: string; userAgent?: string }) {
    const result = await this.prisma.note.updateMany({
      where: { id, userId },
      data: {
        status: NoteStatus.ARCHIVED,
        archivedAt: new Date(),
        trashedAt: null,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Note not found');
    }

    await this.auditLog.logAction({
      userId,
      action: 'NOTE_ARCHIVE',
      details: { noteId: id },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: 'Note archived' };
  }

  async restore(userId: string, id: string, meta?: { ipAddress?: string; userAgent?: string }) {
    const result = await this.prisma.note.updateMany({
      where: {
        id,
        userId,
        status: {
          in: [NoteStatus.ARCHIVED, NoteStatus.TRASHED],
        },
      },
      data: {
        status: NoteStatus.ACTIVE,
        archivedAt: null,
        trashedAt: null,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Archived or trashed note not found',
      );
    }

    await this.auditLog.logAction({
      userId,
      action: 'NOTE_RESTORE',
      details: { noteId: id },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: 'Note restored' };
  }

  async permanentlyDelete(userId: string, id: string, meta?: { ipAddress?: string; userAgent?: string }) {
    // Find the trashed note and collect its attachment storage keys
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId,
        status: NoteStatus.TRASHED,
      },
      select: {
        id: true,
        attachments: {
          select: {
            storageKey: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Trashed note not found');
    }

    // Delete the note and its related attachment records
    const result = await this.prisma.note.deleteMany({
      where: {
        id,
        userId,
        status: NoteStatus.TRASHED,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Trashed note not found');
    }

    // Remove the physical attachment files
    for (const attachment of note.attachments) {
      await this.storage.deleteFile(attachment.storageKey);
    }

    await this.auditLog.logAction({
      userId,
      action: 'NOTE_DELETE_PERMANENT',
      details: { noteId: id },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: 'Note permanently deleted' };
  }
}
