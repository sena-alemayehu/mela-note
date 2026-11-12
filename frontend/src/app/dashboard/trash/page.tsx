
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
  status: "ACTIVE" | "ARCHIVED" | "TRASHED";
  isFavorite?: boolean;
  isPinned?: boolean;
};

export default function TrashPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const isAmharic = language === "am";

  const labels = {
    restore: isAmharic ? "መልስ" : "Restore",
    delete: isAmharic ? "በቋሚነት ሰርዝ" : "Delete permanently",
    empty: isAmharic ? "ቆሻሻውን ባዶ አድርግ" : "Empty Trash",
    emptyTitle: isAmharic ? "ቆሻሻው ባዶ ነው" : "Your Trash is empty",
    emptyDescription: isAmharic
      ? "የሰረዝካቸው ማስታወሻዎች እዚህ ይታያሉ።"
      : "Notes you move to Trash will appear here.",
    count: isAmharic ? "ማስታወሻዎች" : "trashed notes",
    restoreSuccess: isAmharic
      ? "ማስታወሻው ተመልሷል።"
      : "Note restored successfully.",
    deleteSuccess: isAmharic
      ? "ማስታወሻው በቋሚነት ተሰርዟል።"
      : "Note permanently deleted.",
    emptySuccess: isAmharic
      ? "ቆሻሻው ባዶ ሆኗል።"
      : "Trash emptied successfully.",
    confirmEmpty: isAmharic
      ? "በቆሻሻ ውስጥ ያሉትን ሁሉንም ማስታወሻዎች በቋሚነት መሰረዝ ይፈልጋሉ?"
      : "Permanently delete all notes in Trash?",
    untitled: isAmharic ? "ርዕስ የሌለው ማስታወሻ" : "Untitled note",
    noContent: isAmharic ? "ይዘት የለም።" : "No additional content.",
    updated: isAmharic ? "የተሻሻለበት:" : "Updated:",
    recently: isAmharic ? "በቅርቡ" : "Recently",
    back: isAmharic ? "ወደ ዳሽቦርድ ተመለስ" : "Back to Dashboard",
    loading: isAmharic ? "ቆሻሻ እየተጫነ ነው..." : "Loading Trash...",
  };

  useEffect(() => {
    async function loadTrashedNotes() {
      const token = localStorage.getItem("mela-note-access-token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await apiRequest<Note[]>(
          "/notes?status=TRASHED",
          token,
        );

        setNotes(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Could not load trashed notes:", error);
        setFeedback(
          error instanceof Error
            ? error.message
            : "Could not load Trash.",
        );
      } finally {
        setReady(true);
      }
    }

    loadTrashedNotes();
  }, [router]);

  async function handleRestore(noteId: string) {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      await apiRequest(`/notes/${noteId}/restore`, token, {
        method: "PATCH",
      });

      setNotes((previous) =>
        previous.filter((note) => note.id !== noteId),
      );

      setFeedback(labels.restoreSuccess);
    } catch (error) {
      console.error("Could not restore note:", error);
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not restore note.",
      );
    }
  }

  async function handleDeletePermanently(noteId: string) {
    const confirmed = window.confirm(t("confirmPermanentDelete"));

    if (!confirmed) return;

    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      await apiRequest(`/notes/${noteId}/permanent`, token, {
        method: "DELETE",
      });

      setNotes((previous) =>
        previous.filter((note) => note.id !== noteId),
      );

      setFeedback(labels.deleteSuccess);
    } catch (error) {
      console.error("Could not permanently delete note:", error);
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not delete note.",
      );
    }
  }

  async function handleEmptyTrash() {
    if (notes.length === 0 || busy) return;

    const confirmed = window.confirm(labels.confirmEmpty);

    if (!confirmed) return;

    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setBusy(true);

    try {
      await Promise.all(
        notes.map((note) =>
          apiRequest(`/notes/${note.id}/permanent`, token, {
            method: "DELETE",
          }),
        ),
      );

      setNotes([]);
      setFeedback(labels.emptySuccess);
    } catch (error) {
      console.error("Could not empty Trash:", error);

      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not empty Trash.",
      );

      try {
        const response = await apiRequest<Note[]>(
          "/notes?status=TRASHED",
          token,
        );

        setNotes(Array.isArray(response) ? response : []);
      } catch (reloadError) {
        console.error("Could not reload Trash:", reloadError);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <section className="notes-page" lang={language}>
        {labels.loading}
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
          {labels.back}
        </Link>
      </header>

      {feedback && (
        <p role="status" className="notes-feedback">
          {feedback}
        </p>
      )}

      <div className="notes-page-header">
        <p>
          {notes.length} {labels.count}
        </p>

        {notes.length > 0 && (
          <button
            type="button"
            className="notes-delete-button"
            onClick={handleEmptyTrash}
            disabled={busy}
          >
            {busy ? labels.loading : labels.empty}
          </button>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="notes-empty-state">
          <h2>{labels.emptyTitle}</h2>
          <p>{labels.emptyDescription}</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <article key={note.id} className="note-card">
              <h2>{note.title || labels.untitled}</h2>

              <p className="note-card-content">
                {note.content || labels.noContent}
              </p>

              <p className="note-card-date">
                {labels.updated}{" "}
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleDateString()
                  : labels.recently}
              </p>

              <div className="note-card-actions">
                <button
                  type="button"
                  onClick={() => handleRestore(note.id)}
                  disabled={busy}
                >
                  {labels.restore}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePermanently(note.id)}
                  disabled={busy}
                >
                  {labels.delete}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
