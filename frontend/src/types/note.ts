export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type NoteAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  downloadUrl?: string;
  dataUrl?: string;
  file?: File;
};

export type NoteType = 'TEXT' | 'CHECKLIST';
export type NoteStatus = 'ACTIVE' | 'ARCHIVED' | 'TRASHED';

export type Note = {
  id: string;
  title: string;
  content: string;
  type?: NoteType;
  color?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  labels?: string[];
  checklist?: ChecklistItem[];
  attachments?: NoteAttachment[];
  createdAt?: string;
  updatedAt: string;
};
