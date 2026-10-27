
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "../../../styles/notes.css";

type NoteAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  attachments?: NoteAttachment[];
  isTrashed?: boolean;
  isArchived?: boolean;
};

type AttachmentItem = NoteAttachment & {
  noteId: string;
  noteTitle: string;
  noteUpdatedAt: string;
};

type Category = "all" | "images" | "pdfs" | "documents" | "audio" | "other";

function getCategory(type: string, name: string): Category {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("image/")) return "images";

  if (type === "application/pdf" || extension === "pdf") {
    return "pdfs";
  }

  if (
    type.startsWith("audio/") ||
    ["mp3", "wav", "m4a", "ogg", "aac", "flac"].includes(extension)
  ) {
    return "audio";
  }

  if (
    type.includes("document") ||
    type.includes("word") ||
    type.includes("spreadsheet") ||
    type.includes("presentation") ||
    [
      "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "csv",
    ].includes(extension)
  ) {
    return "documents";
  }

  return "other";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("mela-note-demo-notes");

      if (savedNotes) {
        const parsed: Note[] = JSON.parse(savedNotes);
        setNotes(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Could not load attachments:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const allAttachments = useMemo<AttachmentItem[]>(
    () =>
      notes
        .filter((note) => !note.isTrashed && !note.isArchived)
        .flatMap((note) =>
          (note.attachments ?? []).map((attachment) => ({
            ...attachment,
            noteId: note.id,
            noteTitle: note.title?.trim() || "Untitled note",
            noteUpdatedAt: note.updatedAt,
          }))
        ),
    [notes]
  );

  const filteredAttachments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allAttachments
      .filter((attachment) => {
        const matchesSearch =
          attachment.name.toLowerCase().includes(query) ||
          attachment.noteTitle.toLowerCase().includes(query);

        const matchesCategory =
          category === "all" ||
          getCategory(attachment.type, attachment.name) === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const difference =
          new Date(a.noteUpdatedAt).getTime() -
          new Date(b.noteUpdatedAt).getTime();

        return sort === "newest" ? -difference : difference;
      });
  }, [allAttachments, search, category, sort]);

  if (!ready) {
    return <section className="notes-page">Loading attachments...</section>;
  }

  return (
    <section className="notes-page attachments-page">
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">YOUR FILE LIBRARY</p>
          <h1>📎 Attachments</h1>
          <p>Find files attached to your active notes.</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← Dashboard
        </Link>
      </div>

      <div className="attachment-toolbar">
        <input
          type="search"
          className="notes-search-input"
          placeholder="Search files or note titles..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search attachments"
        />

        <select
          className="attachment-select"
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
          aria-label="Filter attachments by type"
        >
          <option value="all">All file types</option>
          <option value="images">Images</option>
          <option value="pdfs">PDF files</option>
          <option value="documents">Documents</option>
          <option value="audio">Audio</option>
          <option value="other">Other files</option>
        </select>

        <select
          className="attachment-select"
          value={sort}
          onChange={(event) =>
            setSort(event.target.value as "newest" | "oldest")
          }
          aria-label="Sort attachments"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        <div className="attachment-view-toggle">
          <button
            type="button"
            className={view === "grid" ? "selected" : ""}
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
          >
            Grid
          </button>
          <button
            type="button"
            className={view === "list" ? "selected" : ""}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            List
          </button>
        </div>
      </div>

      <p className="notes-results-count">
        Showing {filteredAttachments.length} of {allAttachments.length} files
      </p>

      {filteredAttachments.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">📎</div>
          <h2>
            {search || category !== "all"
              ? "No matching attachments"
              : "No attachments yet"}
          </h2>
          <p>
            {search || category !== "all"
              ? "Try another search term or file type."
              : "Attach files to your notes and they will appear here."}
          </p>
          <Link href="/dashboard" className="notes-primary-link">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div
          className={`attachment-results ${
            view === "list" ? "attachment-results-list" : ""
          }`}
        >
          {filteredAttachments.map((attachment) => {
            const fileCategory = getCategory(
              attachment.type,
              attachment.name
            );

            return (
              <article
                className="attachment-card"
                key={`${attachment.noteId}-${attachment.id}`}
              >
                {fileCategory === "images" && attachment.dataUrl ? (
                  <a
                    href={attachment.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-preview"
                    aria-label={`Preview ${attachment.name}`}
                  >
                    <img src={attachment.dataUrl} alt={attachment.name} />
                  </a>
                ) : (
                  <div className="attachment-file-icon" aria-hidden="true">
                    {fileCategory === "pdfs"
                      ? "📕"
                      : fileCategory === "audio"
                        ? "🎵"
                        : fileCategory === "documents"
                          ? "📄"
                          : "📁"}
                  </div>
                )}

                <div className="attachment-card-info">
                  <h2 title={attachment.name}>{attachment.name}</h2>
                  <p className="attachment-file-meta">
                    {formatFileSize(attachment.size)} · {fileCategory}
                  </p>
                  <p className="attachment-note-title">
                    Attached to: {attachment.noteTitle}
                  </p>
                </div>

                {attachment.dataUrl ? (
                  <a
                    className="attachment-download"
                    href={attachment.dataUrl}
                    download={attachment.name}
                  >
                    Download
                  </a>
                ) : (
                  <span className="attachment-unavailable">
                    File unavailable
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
