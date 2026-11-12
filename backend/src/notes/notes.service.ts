
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NoteStatus, NoteType } from '../generated/prisma/client';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

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
  ) {
    return this.prisma.note.create({
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
  }

  async findAll(
    userId: string,
    status: NoteStatus = NoteStatus.ACTIVE,
  ) {
    return this.prisma.note.findMany({
      where: {
        userId,
        status,
      },
      include: {
        attachments: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });
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
      color?: string;
      isPinned?: boolean;
      isFavorite?: boolean;
      labels?: string[];
      checklist?: unknown;
    },
  ) {
    const result = await this.prisma.note.updateMany({
      where: { id, userId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
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

    return this.findOne(userId, id);
  }

  async trash(userId: string, id: string) {
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

    return { message: 'Note moved to Trash' };
  }

  async archive(userId: string, id: string) {
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

    return { message: 'Note archived' };
  }

  async restore(userId: string, id: string) {
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

    return { message: 'Note restored' };
  }

  async permanentlyDelete(userId: string, id: string) {
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

    return { message: 'Note permanently deleted' };
  }
}
