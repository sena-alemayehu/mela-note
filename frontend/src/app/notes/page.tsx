"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Note = {
  id: string | number;
  title?: string;
  content?: string;
  isArchived?: boolean;
  isTrashed?: boolean;
  isPinned?: boolean;
  isFavorite?: boolean;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
};

const STORAGE_KEY = "mela-note-demo-notes";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setNotes(parsed as Note[]);
      }
    } catch (error) {
      console.error("Could not load notes:", error);
    }

    setReady(true);
  }, [router]);

  function saveNotes(updatedNotes: Note[]) {
    setNotes(updatedNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  }

  function archiveNote(id: string | number) {
    saveNotes(
      notes.map((note) =>
        String(note.id) === String(id)
          ? { ...note, isArchived: true, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }

  function trashNote(id: string | number) {
    saveNotes(
      notes.map((note) =>
        String(note.id) === String(id)
          ? { ...note, isTrashed: true, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }

  const activeNotes = notes.filter(
    (note) => !note.isArchived && !note.isTrashed
  );

  if (!ready) {
    return <main style={{ padding: 32 }}>Loading notes...</main>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>YOUR WORKSPACE</p>
          <h1 style={styles.heading}>All Notes</h1>
          <p style={styles.description}>
            View and manage all your active notes in one place.
          </p>
        </div>
        <button style={styles.primaryButton} onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <p style={styles.count}>
        {activeNotes.length} {activeNotes.length === 1 ? "note" : "notes"}
      </p>

      {activeNotes.length === 0 ? (
        <div style={styles.empty}>
          <h2>No notes yet</h2>
          <p>Your active notes will appear here.</p>
          <button
            style={styles.primaryButton}
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {activeNotes.map((note) => (
            <article key={String(note.id)} style={styles.card}>
              <h2 style={styles.noteTitle}>{note.title || "Untitled note"}</h2>
              <p style={styles.noteContent}>
                {note.content || "No additional content."}
              </p>

              <p style={styles.date}>
                Updated:{" "}
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleDateString()
                  : "Recently"}
              </p>

              <div style={styles.actions}>
                <button
                  style={styles.secondaryButton}
                  onClick={() => archiveNote(note.id)}
                >
                  Archive
                </button>
                <button
                  style={styles.dangerButton}
                  onClick={() => trashNote(note.id)}
                >
                  Move to Trash
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const styles = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "36px 24px",
    color: "var(--foreground, #202124)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  eyebrow: {
    color: "#8b6bd6",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 2,
  },
  heading: { fontSize: 32, margin: "8px 0" },
  description: { color: "#777", marginTop: 4 },
  count: { color: "#777", margin: "28px 0 16px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 18,
  },
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 14,
    padding: 20,
    background: "var(--card, #fff)",
  },
  noteTitle: { fontSize: 18, margin: "0 0 12px" },
  noteContent: {
    color: "#666",
    whiteSpace: "pre-wrap" as const,
    overflowWrap: "anywhere" as const,
    minHeight: 55,
  },
  date: { color: "#999", fontSize: 12, marginTop: 18 },
  actions: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 14 },
  primaryButton: {
    background: "#7652c8",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#eee8fa",
    color: "#6544ad",
    border: 0,
    borderRadius: 7,
    padding: "8px 12px",
    cursor: "pointer",
  },
  dangerButton: {
    background: "#fff0f0",
    color: "#c03939",
    border: 0,
    borderRadius: 7,
    padding: "8px 12px",
    cursor: "pointer",
  },
  empty: {
    textAlign: "center" as const,
    padding: 50,
    border: "1px dashed #ccc",
    borderRadius: 14,
    color: "#777",
  },
};