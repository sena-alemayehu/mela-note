"use client";

import { useState, useEffect, useRef, type ChangeEvent, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import { useLanguage } from "../language/LanguageProvider";
import CheckList from "./CheckList";
import type { Note, NoteAttachment, ChecklistItem, NoteType } from "../../types/note";

export type { Note, NoteAttachment };

type NoteEditorProps = {
  note: Note | null;
  onSave: (note: Note) => void | Promise<void>;
  onCancel: () => void;
  onAutosave?: (note: Note) => Promise<void>;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const NOTE_COLORS = [
  { name: "Default", value: "#FFFFFF" },
  { name: "Warm Yellow", value: "#FFF8E1" },
  { name: "Soft Green", value: "#E8F5E9" },
  { name: "Sky Blue", value: "#E3F2FD" },
  { name: "Lavender", value: "#F3E5F5" },
  { name: "Blush Pink", value: "#FCE4EC" },
  { name: "Peach Orange", value: "#FFF3E0" },
];

export default function NoteEditor(props: NoteEditorProps) {
  return (
    <NoteEditorForm
      key={props.note?.id ?? "new-note"}
      {...props}
    />
  );
}

function NoteEditorForm({
  note,
  onSave,
  onCancel,
  onAutosave,
}: NoteEditorProps) {
  const { dict, language } = useLanguage();
  const t = dict.editor;

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [noteType, setNoteType] = useState<NoteType>(note?.type ?? "TEXT");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    Array.isArray(note?.checklist) ? (note!.checklist as ChecklistItem[]) : []
  );
  const [color, setColor] = useState(note?.color || "#FFFFFF");
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [labels, setLabels] = useState<string[]>(
    Array.isArray(note?.labels) ? (note!.labels as string[]) : []
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [attachments, setAttachments] = useState<NoteAttachment[]>(
    note?.attachments ?? []
  );
  const [attachmentError, setAttachmentError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const isInitialMount = useRef(true);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Autosave (Task 15)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus("unsaved");

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    if (onAutosave && note?.id) {
      autosaveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await onAutosave({
            ...note,
            title: title.trim(),
            content: content.trim(),
            type: noteType,
            color,
            isPinned,
            labels,
            checklist,
            updatedAt: new Date().toISOString(),
          });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("unsaved");
        }
      }, 1500);
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [title, content, noteType, checklist, color, isPinned, labels, note, onAutosave]);

  function handleFiles(files: FileList | File[]) {
    setAttachmentError("");
    const selectedFiles = Array.from(files);

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setAttachmentError(
          language === "am"
            ? "የእያንዳንዱ ፋይል መጠን ከ25 MB መብለጥ የለበትም።"
            : `${file.name} is larger than 25 MB.`
        );
        return false;
      }
      return true;
    });

    setAttachments((previous) => [
      ...previous,
      ...validFiles.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        file,
      })),
    ]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
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

  // Label / Tag management (Task 13)
  function handleAddTag() {
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (!labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
    }
    setNewTagInput("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setLabels((prev) => prev.filter((t) => t !== tagToRemove));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasContent =
      title.trim() ||
      content.trim() ||
      checklist.length > 0 ||
      attachments.length > 0;

    if (!hasContent) return;

    onSave({
      ...(note ?? {}),
      id: note?.id ?? crypto.randomUUID(),
      title:
        title.trim() ||
        (language === "am" ? "ርዕስ የሌለው ማስታወሻ" : "Untitled note"),
      content: content.trim(),
      type: noteType,
      color,
      isPinned,
      labels,
      checklist,
      attachments,
      updatedAt: new Date().toISOString(),
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
        style={{ backgroundColor: color !== "#FFFFFF" ? color : undefined }}
      >
        <div className="note-editor-header">
          <div>
            <p className="note-editor-eyebrow">{t.eyebrow}</p>
            <h2 id="note-editor-heading">
              {note ? t.edit : t.create}
            </h2>
          </div>

          <div className="note-editor-header-controls">
            {/* Autosave status indicator */}
            {note?.id && (
              <span className={`note-autosave-status ${saveStatus}`}>
                {saveStatus === "saving" && `● ${t.saving}`}
                {saveStatus === "saved" && `✓ ${t.allSaved}`}
                {saveStatus === "unsaved" && `○ ${t.unsavedChanges}`}
              </span>
            )}

            {/* Pin note toggle */}
            <button
              type="button"
              className={`note-pin-button ${isPinned ? "is-pinned" : ""}`}
              onClick={() => setIsPinned((prev) => !prev)}
              aria-label={isPinned ? t.unpin : t.pin}
              title={isPinned ? t.unpin : t.pin}
            >
              📌
            </button>

            <button
              type="button"
              className="note-editor-close"
              onClick={onCancel}
              aria-label={t.close}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Note Type switcher (Task 12) */}
          <div className="note-type-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={noteType === "TEXT"}
              className={`note-type-tab ${noteType === "TEXT" ? "active" : ""}`}
              onClick={() => setNoteType("TEXT")}
            >
              📄 {t.textNote}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={noteType === "CHECKLIST"}
              className={`note-type-tab ${noteType === "CHECKLIST" ? "active" : ""}`}
              onClick={() => setNoteType("CHECKLIST")}
            >
              ☑️ {t.checklistNote}
            </button>
          </div>

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

          {/* Conditional Note Body: Text or Checklist (Task 12) */}
          {noteType === "CHECKLIST" ? (
            <div className="note-editor-checklist-section">
              <CheckList items={checklist} onChange={setChecklist} />
            </div>
          ) : (
            <>
              <label className="note-editor-label" htmlFor="note-content">
                {t.content}
              </label>

              <textarea
                id="note-content"
                className="note-editor-content"
                placeholder={t.contentPlaceholder}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={7}
              />
            </>
          )}

          {/* Color Palette (Shared Design / Google Keep style) */}
          <div className="note-color-picker">
            <span className="note-picker-label">{t.color}:</span>
            <div className="note-color-options">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`note-color-swatch ${color === c.value ? "is-selected" : ""}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Labels & Tags (Task 13) */}
          <div className="note-labels-section">
            <label className="note-editor-label">{t.labels}</label>
            <div className="note-labels-list">
              {labels.map((tag) => (
                <span key={tag} className="note-tag-chip">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove label ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="note-tag-input-row">
              <input
                type="text"
                placeholder={t.addLabelPlaceholder}
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="note-tag-input"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="note-tag-add-btn"
              >
                + {t.addLabel}
              </button>
            </div>
          </div>

          {/* Attachments Section (Task 6) */}
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
                  aria-label={
                    language === "am"
                      ? "ፋይሎችን ይምረጡ"
                      : "Choose files"
                  }
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
                    {file.dataUrl ? (
                      <a
                        href={file.dataUrl}
                        download={file.name}
                        className="note-attachment-name"
                      >
                        {file.name}
                      </a>
                    ) : (
                      <span className="note-attachment-name">
                        {file.name}
                      </span>
                    )}

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

              <button
                type="submit"
                className="note-editor-save"
              >
                {t.save}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}