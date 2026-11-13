"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NotebookText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/language/LanguageProvider";
import { apiRequest } from "../../../lib/api";
import "../../../styles/notes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  status: "ACTIVE" | "ARCHIVED" | "TRASHED";
  isFavorite?: boolean;
  isPinned?: boolean;
};

export default function AllNotesPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadNotes() {
      const token = localStorage.getItem("mela-note-access-token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await apiRequest<Note[]>(
          "/notes?status=ACTIVE",
          token
        );

        setNotes(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Could not load notes:", error);

        setFeedback(
          error instanceof Error
            ? error.message
            : "Could not load notes."
        );
      } finally {
        setReady(true);
      }
    }

    loadNotes();
  }, [router]);

  const query = search.trim().toLowerCase();

  const filteredNotes = notes.filter((note) => {
    return (
      (note.title || "").toLowerCase().includes(query) ||
      (note.content || "").toLowerCase().includes(query)
    );
  });

  if (!ready) {
    return (
      <section className="notes-page" lang={language}>
        {t("loadingNotes")}
      </section>
    );
  }

  return (
    <section className="notes-page" lang={language}>
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">{t("workspace")}</p>
          <h1>
            <NotebookText className="page-title-icon" size={28} strokeWidth={1.8} aria-hidden="true" />
            {t("allNotes")}
          </h1>
          <p>{t("allNotesDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          {t("backToDashboard")}
        </Link>
      </div>

      {feedback && (
        <p role="alert" className="notes-feedback">
          {feedback}
        </p>
      )}

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
          <div className="notes-empty-icon">♧</div>

          <h2>
            {search ? t("noMatchingNotes") : t("noNotesYet")}
          </h2>

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
                <h2>
                  {note.title.trim() || t("untitledNote")}
                </h2>

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