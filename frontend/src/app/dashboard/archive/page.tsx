
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { useLanguage } from "../../../components/language/LanguageProvider";
import "../../../styles/notes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  status: string;
  isFavorite?: boolean;
  isPinned?: boolean;
};

export default function ArchivePage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const loadArchivedNotes = useCallback(async () => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setError("");

      const data = await apiRequest<Note[]>(
        "/notes?status=ARCHIVED",
        token
      );

      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Could not load archived notes:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load archived notes."
      );
    } finally {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    loadArchivedNotes();
  }, [loadArchivedNotes]);

  async function handleRestore(noteId: string) {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setRestoringId(noteId);
      setError("");
      setFeedback("");

      await apiRequest(
        `/notes/${noteId}/restore`,
        token,
        {
          method: "PATCH",
        }
      );

      setNotes((previous) =>
        previous.filter((note) => note.id !== noteId)
      );

      setFeedback("Note restored successfully.");
    } catch (err) {
      console.error("Could not restore note:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to restore note."
      );
    } finally {
      setRestoringId(null);
    }
  }

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
          <p className="notes-page-eyebrow">
            {t("yourCollection")}
          </p>

          <h1>▣ {t("archive")}</h1>

          <p>{t("archiveDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← {t("backToDashboard")}
        </Link>
      </div>

      {error && (
        <p role="alert" className="notes-error-message">
          {error}
        </p>
      )}

      {feedback && (
        <p role="status" className="notes-success-message">
          {feedback}
        </p>
      )}

      <p className="notes-results-count">
        {notes.length}{" "}
        {notes.length === 1
          ? t("archivedNote")
          : t("archivedNotes")}
      </p>

      {notes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">▣</div>

          <h2>{t("emptyArchive")}</h2>

          <p>{t("archiveExplanation")}</p>

          <Link
            href="/dashboard"
            className="notes-primary-link"
          >
            {t("goToDashboard")}
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {notes.map((note) => (
            <article
              className="notes-list-card"
              key={note.id}
            >
              <div className="notes-list-card-top">
                <h2>
                  {note.title.trim() || t("untitledNote")}
                </h2>

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
                disabled={restoringId === note.id}
              >
                {restoringId === note.id
                  ? "Restoring..."
                  : t("restoreActive")}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
