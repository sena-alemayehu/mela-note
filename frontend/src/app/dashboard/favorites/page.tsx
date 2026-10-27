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
  isTrashed?: boolean;
  isArchived?: boolean;
};

export default function FavoritesPage() {
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
      console.error("Could not load favorite notes:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const favoriteNotes = notes.filter(
    (note) =>
      note.isFavorite === true &&
      !note.isTrashed &&
      !note.isArchived
  );

  if (!ready) {
    return <section className="notes-page">{t("loadingFavorites")}</section>;
  }

  return (
    <section className="notes-page" lang={language}>
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">{t("yourCollection")}</p>
          <h1>♥ {t("favorites")}</h1>
          <p>{t("favoritesDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          {t("backToDashboard")}
        </Link>
      </div>

      <p className="notes-results-count">
        {favoriteNotes.length}{" "}
        {language === "am"
          ? t("favoriteNotes")
          : favoriteNotes.length === 1
            ? t("favoriteNote")
            : t("favoriteNotes")}
      </p>

      {favoriteNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">♡</div>
          <h2>{t("noFavorites")}</h2>
          <p>{t("markFavorite")}</p>
          <Link href="/dashboard" className="notes-primary-link">
            {t("goToDashboard")}
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {favoriteNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || t("untitledNote")}</h2>
                <span className="notes-status-badge">
                  ♥ {t("favorite")}
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
