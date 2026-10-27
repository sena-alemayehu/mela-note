
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../../../styles/notes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  isPinned?: boolean;
  isTrashed?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
};

export default function PinnedNotesPage() {
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
      console.error("Could not load pinned notes:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const pinnedNotes = notes.filter(
    (note) =>
      note.isPinned === true &&
      !note.isTrashed &&
      !note.isArchived
  );

  if (!ready) {
    return <section className="notes-page">Loading pinned notes...</section>;
  }

  return (
    <section className="notes-page">
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">QUICK ACCESS</p>
          <h1>📌 Pinned Notes</h1>
          <p>Keep your most important notes easy to find.</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← Dashboard
        </Link>
      </div>

      <p className="notes-results-count">
        {pinnedNotes.length}{" "}
        {pinnedNotes.length === 1 ? "pinned note" : "pinned notes"}
      </p>

      {pinnedNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">📌</div>
          <h2>No pinned notes yet</h2>
          <p>
            Pin important notes to make them appear here. Your existing notes
            are safe.
          </p>
          <Link href="/dashboard" className="notes-primary-link">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {pinnedNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || "Untitled note"}</h2>
                <span className="notes-status-badge">📌 Pinned</span>
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
