
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

export default function ArchivePage() {
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
      console.error("Could not load archived notes:", error);
    } finally {
      setReady(true);
    }
  }, []);

  function handleRestore(noteId: string) {
    const updatedNotes = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            isArchived: false,
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

  const archivedNotes = notes.filter(
    (note) => note.isArchived === true && !note.isTrashed
  );

  if (!ready) {
    return (
      <section className="notes-page" lang={language}>
        {t("loadingArchive")}
      </section>
    );
  }

  return (
    <section className="notes-page" lang={language}>
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">{t("yourCollection")}</p>
          <h1>▣ {t("archive")}</h1>
          <p>{t("archiveDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← {t("backToDashboard")}
        </Link>
      </div>

      <p className="notes-results-count">
        {archivedNotes.length}{" "}
        {archivedNotes.length === 1
          ? t("archivedNote")
          : t("archivedNotes")}
      </p>

      {archivedNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">▣</div>
          <h2>{t("emptyArchive")}</h2>
          <p>{t("archiveExplanation")}</p>

          <Link href="/dashboard" className="notes-primary-link">
            {t("goToDashboard")}
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {archivedNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || t("untitledNote")}</h2>
                <span className="notes-status-badge">
                  {t("archived")}
                </span>
              </div>

              <p className="notes-card-content">
                {note.content || t("noText")}
              </p>

              <p className="notes-card-date">
                {t("updated")}{" "}
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleString(
                      language === "am" ? "am-ET" : "en-US"
                    )
                  : t("recently")}
              </p>

              <button
                type="button"
                className="notes-restore-button"
                onClick={() => handleRestore(note.id)}
              >
                {t("restoreActive")}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
