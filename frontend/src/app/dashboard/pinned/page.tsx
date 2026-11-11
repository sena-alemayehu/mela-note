
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/language/LanguageProvider";
import { apiRequest } from "../../../lib/api";
import "../../../styles/notes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  isPinned?: boolean;
};

export default function PinnedNotesPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPinnedNotes() {
      const token = localStorage.getItem("mela-note-access-token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<Note[]>(
          "/notes?status=ACTIVE",
          token
        );

        if (!cancelled) {
          setNotes(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load pinned notes."
          );
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    loadPinnedNotes();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const pinnedNotes = notes.filter(
    (note) => note.isPinned === true
  );

  if (!ready) {
    return (
      <section className="notes-page">
        {t("loadingPinned")}
      </section>
    );
  }

  return (
    <section className="notes-page" lang={language}>
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">{t("quickAccess")}</p>
          <h1>📌 {t("pinnedNotes")}</h1>
          <p>{t("pinnedDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          {t("backToDashboard")}
        </Link>
      </div>

      {error && (
        <div className="notes-empty-state">
          <h2>{t("noPinnedNotes")}</h2>
          <p>{error}</p>
          <button
            type="button"
            className="notes-primary-link"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          <p className="notes-results-count">
            {pinnedNotes.length}{" "}
            {language === "am"
              ? t("pinnedNotesCount")
              : pinnedNotes.length === 1
                ? t("pinnedNote")
                : t("pinnedNotesCount")}
          </p>

          {pinnedNotes.length === 0 ? (
            <div className="notes-empty-state">
              <div className="notes-empty-icon">📌</div>
              <h2>{t("noPinnedNotes")}</h2>
              <p>{t("pinImportantNotes")}</p>
              <Link
                href="/dashboard"
                className="notes-primary-link"
              >
                {t("goToDashboard")}
              </Link>
            </div>
          ) : (
            <div className="notes-list-grid">
              {pinnedNotes.map((note) => (
                <article
                  className="notes-list-card"
                  key={note.id}
                >
                  <div className="notes-list-card-top">
                    <h2>
                      {note.title.trim() || t("untitledNote")}
                    </h2>

                    <span className="notes-status-badge">
                      📌 {t("pinned")}
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
        </>
      )}
    </section>
  );
}
