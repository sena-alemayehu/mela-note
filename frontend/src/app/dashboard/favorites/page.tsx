
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    return <section className="notes-page">Loading favorites...</section>;
  }

  return (
    <section className="notes-page">
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">YOUR COLLECTION</p>
          <h1>♥ Favorites</h1>
          <p>Find the notes you have marked as your favorites.</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← Dashboard
        </Link>
      </div>

      <p className="notes-results-count">
        {favoriteNotes.length}{" "}
        {favoriteNotes.length === 1 ? "favorite note" : "favorite notes"}
      </p>

      {favoriteNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">♡</div>
          <h2>No favorites yet</h2>
          <p>
            Mark a note as a favorite from your dashboard, and it will appear
            here.
          </p>
          <Link href="/dashboard" className="notes-primary-link">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {favoriteNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || "Untitled note"}</h2>
                <span className="notes-status-badge">♥ Favorite</span>
              </div>

              <p className="notes-card-content">
                {note.content || "This note has no text yet."}
              </p>

              <p className="notes-card-date">
                Updated{" "}
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleString()
                  : "recently"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
