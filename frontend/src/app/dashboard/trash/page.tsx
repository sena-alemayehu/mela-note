
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

export default function TrashPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("mela-note-demo-notes");

      if (savedNotes) {
        setNotes(JSON.parse(savedNotes) as Note[]);
      }
    } catch (error) {
      console.error("Could not load trashed notes:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const trashedNotes = notes.filter(
    (note) => note.isTrashed === true
  );

  function handleRestore(noteId: string) {
    const updatedNotes = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            isTrashed: false,
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

  function handleDeletePermanently(noteId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this note? This action cannot be undone."
    );

    if (!confirmed) return;

    const updatedNotes = notes.filter(
      (note) => note.id !== noteId
    );

    setNotes(updatedNotes);
    localStorage.setItem(
      "mela-note-demo-notes",
      JSON.stringify(updatedNotes)
    );
  }

  if (!ready) {
    return <div className="notes-page">Loading Trash...</div>;
  }

  return (
    <section className="notes-page">
      <header className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">RECOVER OR DELETE</p>
          <h1>Trash</h1>
          <p>Restore notes or permanently delete the ones you no longer need.</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          Back to Dashboard
        </Link>
      </header>

      {trashedNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">♲</div>
          <h2>Your Trash is empty</h2>
          <p>Notes you move to Trash will appear here.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {trashedNotes.map((note) => (
            <article className="note-card" key={note.id}>
              <div className="note-card-header">
                <h2>{note.title || "Untitled note"}</h2>
                <span className="note-badge">In Trash</span>
              </div>

              <p className="note-card-content">
                {note.content || "This note has no text content."}
              </p>

              <p className="note-card-date">
                Last updated:{" "}
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>

              <div className="notes-trash-actions">
                <button
                  type="button"
                  className="notes-restore-button"
                  onClick={() => handleRestore(note.id)}
                >
                  ↶ Restore
                </button>

                <button
                  type="button"
                  className="notes-danger-button"
                  onClick={() => handleDeletePermanently(note.id)}
                >
                  Permanently Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
