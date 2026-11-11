
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

type Note = {
  id: string;
  title?: string;
  content?: string;
  status: "ACTIVE" | "ARCHIVED" | "TRASHED";
  updatedAt?: string;
};

export default function ArchivePage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadArchivedNotes() {
      const token = localStorage.getItem("mela-note-access-token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await apiRequest<Note[]>(
          "/notes?status=ARCHIVED",
          token,
        );

        setNotes(response);
      } catch (error) {
        console.error("Loading archived notes failed:", error);
        setFeedback(
          error instanceof Error
            ? error.message
            : "Could not load archived notes.",
        );
      } finally {
        setReady(true);
      }
    }

    loadArchivedNotes();
  }, [router]);

  async function restoreNote(id: string) {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      await apiRequest(`/notes/${id}/restore`, token, {
        method: "PATCH",
      });

      setNotes((previous) =>
        previous.filter((note) => note.id !== id),
      );

      setFeedback("Note restored successfully.");
    } catch (error) {
      console.error("Restoring note failed:", error);
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not restore note.",
      );
    }
  }

  async function trashNote(id: string) {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      await apiRequest(`/notes/${id}/trash`, token, {
        method: "PATCH",
      });

      setNotes((previous) =>
        previous.filter((note) => note.id !== id),
      );

      setFeedback("Note moved to Trash successfully.");
    } catch (error) {
      console.error("Moving note to Trash failed:", error);
      setFeedback(
        error instanceof Error
          ? error.message
          : "Could not move note to Trash.",
      );
    }
  }

  if (!ready) {
    return <main style={{ padding: 32 }}>Loading archive...</main>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>YOUR WORKSPACE</p>
          <h1 style={styles.heading}>Archive</h1>
          <p style={styles.description}>
            Notes you have archived are kept here.
          </p>
        </div>

        <button
          style={styles.primaryButton}
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {feedback && (
        <p role="status" style={styles.feedback}>
          {feedback}
        </p>
      )}

      <p style={styles.count}>
        {notes.length}{" "}
        {notes.length === 1 ? "archived note" : "archived notes"}
      </p>

      {notes.length === 0 ? (
        <div style={styles.empty}>
          <h2>Your archive is empty</h2>
          <p>Notes you archive will appear here.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {notes.map((note) => (
            <article key={note.id} style={styles.card}>
              <h2 style={styles.noteTitle}>
                {note.title || "Untitled note"}
              </h2>

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
                  onClick={() => restoreNote(note.id)}
                >
                  Restore
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
  feedback: {
    color: "#6544ad",
    marginTop: 20,
  },
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
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginTop: 14,
  },
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
