
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../language/LanguageProvider";

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  isFavorite?: boolean;
  isTrashed?: boolean;
};

type NoteEditorProps = {
  note: Note | null;
  onSave: (note: Note) => void;
  onCancel: () => void;
};

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

  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
  }, [note]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() && !content.trim()) return;

    onSave({
      id: note?.id ?? crypto.randomUUID(),
      title: title.trim() || (language === "am" ? "ርዕስ የሌለው ማስታወሻ" : "Untitled note"),
      content: content.trim(),
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
      >
        <div className="note-editor-header">
          <div>
            <p className="note-editor-eyebrow">{t.eyebrow}</p>
            <h2 id="note-editor-heading">{note ? t.edit : t.create}</h2>
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
