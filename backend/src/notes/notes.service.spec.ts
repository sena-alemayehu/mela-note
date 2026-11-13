import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteStatus, NoteType } from '../generated/prisma/client';

describe('NotesService', () => {
  let notesService: NotesService;
  let mockPrisma: any;
  let mockStorage: any;
  let mockAuditLog: any;

  beforeEach(() => {
    mockPrisma = {
      note: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    mockStorage = {
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    mockAuditLog = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };

    notesService = new NotesService(mockPrisma, mockStorage, mockAuditLog);
  });

  describe('create', () => {
    it('should create a note with checklist and labels', async () => {
      const mockCreated = {
        id: 'note-1',
        title: 'Shopping List',
        content: '',
        type: NoteType.CHECKLIST,
        checklist: [{ id: '1', text: 'Apples', completed: false }],
        labels: ['groceries', 'personal'],
        userId: 'user-1',
      };

      mockPrisma.note.create.mockResolvedValue(mockCreated);

      const result = await notesService.create('user-1', {
        title: 'Shopping List',
        content: '',
        type: NoteType.CHECKLIST,
        checklist: [{ id: '1', text: 'Apples', completed: false }],
        labels: ['groceries', 'personal'],
      });

      expect(result).toEqual(mockCreated);
      expect(mockAuditLog.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'NOTE_CREATE', userId: 'user-1' }),
      );
    });
  });

  describe('record ownership verification (Task 5)', () => {
    it('should only return notes belonging to the requesting user in findAll', async () => {
      mockPrisma.note.findMany.mockResolvedValue([]);

      await notesService.findAll('user-owner-123', { status: NoteStatus.ACTIVE });

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-owner-123',
            status: NoteStatus.ACTIVE,
          }),
        }),
      );
    });

    it('should throw NotFoundException if note does not belong to user in findOne', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(
        notesService.findOne('user-attacker', 'note-belonging-to-other'),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
        where: { id: 'note-belonging-to-other', userId: 'user-attacker' },
        include: { attachments: true },
      });
    });

    it('should safely delete trashed note and remove its attachment files from disk', async () => {
      mockPrisma.note.findFirst.mockResolvedValue({
        id: 'note-1',
        attachments: [{ storageKey: 'uuid-1.png' }, { storageKey: 'uuid-2.pdf' }],
      });
      mockPrisma.note.deleteMany.mockResolvedValue({ count: 1 });

      const result = await notesService.permanentlyDelete('user-1', 'note-1');

      expect(result.message).toBe('Note permanently deleted');
      expect(mockStorage.deleteFile).toHaveBeenCalledWith('uuid-1.png');
      expect(mockStorage.deleteFile).toHaveBeenCalledWith('uuid-2.pdf');
      expect(mockAuditLog.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'NOTE_DELETE_PERMANENT' }),
      );
    });
  });
});
