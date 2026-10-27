
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../../components/language/LanguageProvider";
import "../../../styles/notes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
};

export default function TrashPage() {
  const { language, t } = useLanguage();

  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("mela-note-demo-notes");

      if (savedNotes) {
        const parsed: Note[] = JSON.parse(savedNotes);
        setNotes(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Could not load trashed notes:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const trashedNotes = notes.filter(
    (note) => note.isTrashed === true
  );

  function handleRestore(noteId: string) {
    const updatedNotes = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            isTrashed: false,
            updatedAt: new Date().toISOString(),
          }
        : note
    );

    setNotes(updatedNotes);
    localStorage.setItem(
      "mela-note-demo-notes",
      JSON.stringify(updatedNotes)
    );
  }

  function handleDeletePermanently(noteId: string) {
    const confirmed = window.confirm(t("confirmPermanentDelete"));

    if (!confirmed) return;

    const updatedNotes = notes.filter(
      (note) => note.id !== noteId
    );

    setNotes(updatedNotes);
    localStorage.setItem(
      "mela-note-demo-notes",
      JSON.stringify(updatedNotes)
    );
  }

  if (!ready) {
    return (
      <section className="notes-page" lang={language}>
        {t("loadingTrash")}
      </section>
    );
  }

  return (
    <section className="notes-page" lang={language}>
      <header className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">
            {t("recoverOrDelete")}
          </p>

          <h1>{t("trash")}</h1>

          <p>{t("trashDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← {t("backToDashboard")}
        </Link>
      </header>

      {trashedNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">♲</div>
          <h2>{t("emptyTrash")}</h2>
          <p>{t("trashExplanation")}</p>

          <Link href="/dashboard" className="notes-primary-link">
            {t("goToDashboard")}
          </Link>
        </div>
      ) : (
        <div className="notes-grid">
          {trashedNotes.map((note) => (
            <article className="note-card" key={note.id}>
              <div className="note-card-header">
                <h2>{note.title.trim() || t("untitledNote")}</h2>

                <span className="note-badge">
                  {t("inTrash")}
                </span>
              </div>

              <p className="note-card-content">
                {note.content || t("noTextContent")}
              </p>

              <p className="note-card-date">
                {t("lastUpdated")}{" "}
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleDateString(
                      language === "am" ? "am-ET" : "en-US"
                    )
                  : t("recently")}
              </p>

              <div className="notes-trash-actions">
                <button
                  type="button"
                  className="notes-restore-button"
                  onClick={() => handleRestore(note.id)}
                >
                  ↶ {t("restore")}
                </button>

                <button
                  type="button"
                  className="notes-danger-button"
                  onClick={() => handleDeletePermanently(note.id)}
                >
                  {t("permanentlyDelete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
