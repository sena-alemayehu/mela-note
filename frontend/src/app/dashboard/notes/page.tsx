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

export default function AllNotesPage() {
  const { language, t } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("mela-note-demo-notes");

      if (savedNotes) {
        const parsed: Note[] = JSON.parse(savedNotes);
        setNotes(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Could not load saved notes:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const filteredNotes = notes.filter((note) => {
    if (note.isTrashed || note.isArchived) return false;

    const query = search.trim().toLowerCase();

    return (
      (note.title || "").toLowerCase().includes(query) ||
      (note.content || "").toLowerCase().includes(query)
    );
  });

  if (!ready) {
    return <section className="notes-page">{t("loadingNotes")}</section>;
  }

  return (
    <section className="notes-page" lang={language}>
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">{t("workspace")}</p>
          <h1>{t("allNotes")}</h1>
          <p>{t("allNotesDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          {t("backToDashboard")}
        </Link>
      </div>

      <div className="notes-search-wrapper">
        <input
          type="search"
          className="notes-search-input"
          placeholder={t("searchNotes")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label={t("searchNotesLabel")}
        />
      </div>

      <p className="notes-results-count">
        {filteredNotes.length}{" "}
        {language === "am"
          ? t("notes")
          : filteredNotes.length === 1
            ? t("note")
            : t("notes")}
      </p>

      {filteredNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">▤</div>
          <h2>{search ? t("noMatchingNotes") : t("noNotesYet")}</h2>
          <p>
            {search
              ? t("tryDifferentSearch")
              : t("createFirstNote")}
          </p>
          <Link href="/dashboard" className="notes-primary-link">
            {t("goToDashboard")}
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {filteredNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || t("untitledNote")}</h2>

                <div className="notes-card-badges">
                  {note.isPinned && (
                    <span className="notes-status-badge">
                      📌 {t("pinned")}
                    </span>
                  )}
                  {note.isFavorite && (
                    <span className="notes-status-badge">
                      ♥ {t("favorite")}
                    </span>
                  )}
                </div>
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
