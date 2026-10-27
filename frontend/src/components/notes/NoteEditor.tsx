
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../language/LanguageProvider";

export type NoteAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  isFavorite?: boolean;
  isTrashed?: boolean;
  attachments?: NoteAttachment[];
  isPinned?: boolean;
  isArchived?: boolean;
};

type NoteEditorProps = {
  note: Note | null;
  onSave: (note: Note) => void;
  onCancel: () => void;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const translations = {
  en: {
    eyebrow: "YOUR PERSONAL SPACE",
    edit: "Edit note",
    create: "Create a note",
    title: "Note title",
    titlePlaceholder: "Give your note a title...",
    content: "Your thoughts",
    contentPlaceholder: "Start writing your thoughts here...",
    cancel: "Cancel",
    save: "Save note",
    characters: "characters",
    close: "Close editor",
    attachments: "Attachments",
    addFiles: "Choose files",
    noFiles: "No files attached yet.",
    removeFile: "Remove",
    fileTooLarge: "Each file must be 25 MB or smaller.",
    readError: "A file could not be read. Please try again.",
    fileCount: "attached",
  },
  am: {
    eyebrow: "የእርስዎ የግል ቦታ",
    edit: "ማስታወሻ ያርትዑ",
    create: "ማስታወሻ ይፍጠሩ",
    title: "የማስታወሻ ርዕስ",
    titlePlaceholder: "የማስታወሻዎን ርዕስ ያስገቡ...",
    content: "ሀሳቦችዎ",
    contentPlaceholder: "ሀሳቦችዎን እዚህ መጻፍ ይጀምሩ...",
    cancel: "ይቅር",
    save: "ማስታወሻውን ያስቀምጡ",
    characters: "ቁምፊዎች",
    close: "አርታዒውን ዝጋ",
    attachments: "የተያያዙ ፋይሎች",
    addFiles: "ፋይሎችን ይምረጡ",
    noFiles: "እስካሁን ምንም ፋይል አልተያያዘም።",
    removeFile: "አስወግድ",
    fileTooLarge: "እያንዳንዱ ፋይል ከ25 ሜባ መብለጥ የለበትም።",
    readError: "ፋይሉን ማንበብ አልተቻለም። እንደገና ይሞክሩ።",
    fileCount: "ተያይዘዋል",
  },
};

export default function NoteEditor({
  note,
  onSave,
  onCancel,
}: NoteEditorProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [attachments, setAttachments] = useState<NoteAttachment[]>(
    note?.attachments ?? []
  );
  const [attachmentError, setAttachmentError] = useState("");
const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setAttachments(note?.attachments ?? []);
    setAttachmentError("");
  }, [note]);

 function handleFiles(files: FileList | File[]) {
  setAttachmentError("");

  const selectedFiles = Array.from(files);

  selectedFiles.forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      setAttachmentError(
        language === "am"
          ? "የእያንዳንዱ ፋይል መጠን ከ25 MB መብለጥ የለበትም።"
          : "Each file must be 25 MB or smaller."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") return;

      setAttachments((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: reader.result as string,
        },
      ]);
    };

    reader.onerror = () => {
      setAttachmentError(
        language === "am"
          ? "ፋይሉን ማንበብ አልተቻለም።"
          : `Could not read ${file.name}. Please try again.`
      );
    };

    reader.readAsDataURL(file);
  });
}

function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  if (event.target.files) {
    handleFiles(event.target.files);
  }

  event.target.value = "";
}

function handleDrop(event: React.DragEvent<HTMLDivElement>) {
  event.preventDefault();
  setIsDragging(false);

  if (event.dataTransfer.files.length > 0) {
    handleFiles(event.dataTransfer.files);
  }
}
  function handleRemoveAttachment(attachmentId: string) {
    setAttachments((current) =>
      current.filter((file) => file.id !== attachmentId)
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() && !content.trim() && attachments.length === 0) {
      return;
    }

    onSave({
      ...(note ?? {}),
      id: note?.id ?? crypto.randomUUID(),
      title:
        title.trim() ||
        (language === "am"
          ? "ርዕስ የሌለው ማስታወሻ"
          : "Untitled note"),
      content: content.trim(),
      updatedAt: new Date().toISOString(),
      attachments,
    });
  }

  return (
    <div className="note-editor-overlay">
      <section
        className="note-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-heading"
        lang={language}
      >
        <div className="note-editor-header">
          <div>
            <p className="note-editor-eyebrow">{t.eyebrow}</p>
            <h2 id="note-editor-heading">
              {note ? t.edit : t.create}
            </h2>
          </div>

          <button
            type="button"
            className="note-editor-close"
            onClick={onCancel}
            aria-label={t.close}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="note-editor-label" htmlFor="note-title">
            {t.title}
          </label>

          <input
            id="note-title"
            className="note-editor-title"
            type="text"
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={150}
            autoFocus
          />

          <label className="note-editor-label" htmlFor="note-content">
            {t.content}
          </label>

          <textarea
            id="note-content"
            className="note-editor-content"
            placeholder={t.contentPlaceholder}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={9}
          />

          <section className="note-attachments">
            <h3>{t.attachments}</h3>

            <div
  className={`note-dropzone ${isDragging ? "is-dragging" : ""}`}
  onDragEnter={(event) => {
    event.preventDefault();
    setIsDragging(true);
  }}
  onDragOver={(event) => {
    event.preventDefault();
    setIsDragging(true);
  }}
  onDragLeave={(event) => {
    event.preventDefault();

    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }}
  onDrop={handleDrop}
>
  <div className="note-dropzone-icon" aria-hidden="true">
    ↑
  </div>

  <p>
    {language === "am"
      ? "ፋይሎችን እዚህ ይጎትቱና ይልቀቁ፣ ወይም"
      : "Drag files here to attach, or"}
  </p>

  <label className="note-attachment-picker">
    {language === "am" ? "ፋይል ይምረጡ" : "Browse"}
    <input
      type="file"
      multiple
      onChange={handleFileChange}
      aria-label={language === "am" ? "ፋይሎችን ይምረጡ" : "Choose files"}
    />
  </label>

  <span className="note-dropzone-limit">
    {language === "am"
      ? "እስከ 25 MB በእያንዳንዱ ፋይል"
      : "Up to 25 MB per file"}
  </span>
</div>

            {attachmentError && (
              <p role="alert" className="note-attachment-error">
                {attachmentError}
              </p>
            )}

            {attachments.length === 0 ? (
              <p className="note-attachments-empty">{t.noFiles}</p>
            ) : (
              <ul className="note-attachment-list">
                {attachments.map((file) => (
                  <li key={file.id} className="note-attachment-item">
                    <a
                      href={file.dataUrl}
                      download={file.name}
                      className="note-attachment-name"
                    >
                      {file.name}
                    </a>

                    <span className="note-attachment-size">
                      {Math.max(1, Math.round(file.size / 1024))} KB
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      aria-label={`${t.removeFile}: ${file.name}`}
                    >
                      {t.removeFile}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="note-editor-footer">
            <span className="note-editor-count">
              {content.length} {t.characters}
            </span>

            <div className="note-editor-actions">
              <button
                type="button"
                className="note-editor-cancel"
                onClick={onCancel}
              >
                {t.cancel}
              </button>

              <button type="submit" className="note-editor-save">
                {t.save}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
