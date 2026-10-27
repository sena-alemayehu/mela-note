
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

export default function AllNotesPage() {
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
    return <section className="notes-page">Loading notes...</section>;
  }

  return (
    <section className="notes-page">
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">YOUR WORKSPACE</p>
          <h1>All Notes</h1>
          <p>Find and review all your active notes in one place.</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← Dashboard
        </Link>
      </div>

      <div className="notes-search-wrapper">
        <input
          type="search"
          className="notes-search-input"
          placeholder="Search your notes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search notes"
        />
      </div>

      <p className="notes-results-count">
        {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
      </p>

      {filteredNotes.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">▤</div>
          <h2>{search ? "No matching notes" : "No notes yet"}</h2>
          <p>
            {search
              ? "Try a different search term."
              : "Create your first note from the dashboard to see it here."}
          </p>
          <Link href="/dashboard" className="notes-primary-link">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="notes-list-grid">
          {filteredNotes.map((note) => (
            <article className="notes-list-card" key={note.id}>
              <div className="notes-list-card-top">
                <h2>{note.title.trim() || "Untitled note"}</h2>

                <div className="notes-card-badges">
                  {note.isPinned && (
                    <span className="notes-status-badge">📌 Pinned</span>
                  )}
                  {note.isFavorite && (
                    <span className="notes-status-badge">♥ Favorite</span>
                  )}
                </div>
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
