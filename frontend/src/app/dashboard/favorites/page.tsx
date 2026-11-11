
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
  isFavorite: boolean;
  isPinned?: boolean;
};

export default function FavoritesPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      const token = localStorage.getItem("mela-note-access-token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await apiRequest<Note[]>("/notes/favorites", token);

        if (!cancelled) {
          setNotes(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load favorite notes."
          );
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <section className="notes-page">
        {t("loadingFavorites")}
      </section>
    );
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

      {error ? (
        <div className="notes-empty-state">
          <h2>{t("noFavorites")}</h2>
          <p>{error}</p>
          <button
            type="button"
            className="notes-primary-link"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <p className="notes-results-count">
            {notes.length}{" "}
            {language === "am"
              ? t("favoriteNotes")
              : notes.length === 1
                ? t("favoriteNote")
                : t("favoriteNotes")}
          </p>

          {notes.length === 0 ? (
            <div className="notes-empty-state">
              <div className="notes-empty-icon">♡</div>
              <h2>{t("noFavorites")}</h2>
              <p>{t("markFavorite")}</p>
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
        </>
      )}
    </section>
  );
}
