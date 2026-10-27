
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
  isArchived?: boolean;
  isTrashed?: boolean;
};

export default function ArchivePage() {
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
    return <section className="notes-page">Loading archive...</section>;
  }

  return (
    <section className="notes-page">
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">YOUR COLLECTION</p>
          <h1>▣ Archive</h1>
          <p>Keep notes you want to save outside your active workspace.</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← Dashboard
        </Link>
      </div>

      <p className="notes-results-count">
        {archivedNotes.length}{" "}
        {archivedNotes.length === 1 ? "archived note" : "archived notes"}
      </p>

      {archivedNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">▣</div>
          <h2>Your archive is empty</h2>
          <p>
            When you archive a note, it will appear here. Archiving does not
            permanently delete your note.
          </p>
          <Link href="/dashboard" className="notes-primary-link">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {archivedNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || "Untitled note"}</h2>
                <span className="notes-status-badge">Archived</span>
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

              <button
                type="button"
                className="notes-restore-button"
                onClick={() => handleRestore(note.id)}
              >
                Restore to active notes
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
