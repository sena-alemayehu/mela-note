"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../components/language/LanguageProvider";
import { apiRequest } from "../../../lib/api";
import "../../../styles/notes.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

type Category =
  | "all"
  | "images"
  | "pdfs"
  | "documents"
  | "audio"
  | "other";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type AttachmentItem = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  noteId: string;
  noteTitle: string;
  noteUpdatedAt: string;
  downloadUrl: string;
};

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

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [ready, setReady] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setError("");

      const [attachmentData, noteData] = await Promise.all([
        apiRequest<AttachmentItem[]>("/attachments", token),
        apiRequest<Note[]>("/notes?status=ACTIVE", token),
      ]);

      setAttachments(
        Array.isArray(attachmentData) ? attachmentData : []
      );

      setNotes(Array.isArray(noteData) ? noteData : []);
    } catch (err) {
      console.error("Could not load attachments:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attachments."
      );
    } finally {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpload() {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedNoteId) {
      setError("Please select a note first.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must not exceed 25 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setFeedback("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/attachments/notes/${selectedNoteId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `Upload failed (${response.status})`
        );
      }

      setSelectedFile(null);

      const fileInput = document.getElementById(
        "attachment-file-input"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setFeedback("Attachment uploaded successfully.");

      await loadData();
    } catch (err) {
      console.error("Attachment upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload attachment."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(attachment: AttachmentItem) {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setDownloadingId(attachment.id);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/attachments/${attachment.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message || `Download failed (${response.status})`
        );
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = attachment.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);

      setFeedback("Download started.");
    } catch (err) {
      console.error("Attachment download failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download attachment."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(attachmentId: string) {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this attachment?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(attachmentId);
      setError("");
      setFeedback("");

      await apiRequest(
        `/attachments/${attachmentId}`,
        token,
        {
          method: "DELETE",
        }
      );

      setAttachments((previous) =>
        previous.filter((item) => item.id !== attachmentId)
      );

      setFeedback("Attachment deleted successfully.");
    } catch (err) {
      console.error("Attachment deletion failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete attachment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAttachments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attachments
      .filter((attachment) => {
        const matchesSearch =
          attachment.fileName.toLowerCase().includes(query) ||
          (attachment.noteTitle || "").toLowerCase().includes(query);

        const matchesCategory =
          category === "all" ||
          getCategory(attachment.mimeType, attachment.fileName) ===
            category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const difference =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime();

        return sort === "newest" ? -difference : difference;
      });
  }, [attachments, search, category, sort]);

  const categoryLabels: Record<Category, string> = {
    all: t("allFileTypes"),
    images: t("images"),
    pdfs: t("pdfFiles"),
    documents: t("documents"),
    audio: t("audio"),
    other: t("otherFiles"),
  };

  if (!ready) {
    return (
      <section className="notes-page" lang={language}>
        {t("loadingAttachments")}
      </section>
    );
  }

  return (
    <section
      className="notes-page attachments-page"
      lang={language}
    >
      <div className="notes-page-header">
        <div>
          <p className="notes-page-eyebrow">
            {t("fileLibrary")}
          </p>

          <h1>
            <Paperclip className="page-title-icon" size={28} strokeWidth={1.8} aria-hidden="true" />
            {t("attachments")}
          </h1>

          <p>{t("attachmentsDescription")}</p>
        </div>

        <Link href="/dashboard" className="notes-back-link">
          ← {t("backToDashboard")}
        </Link>
      </div>

      {error && (
        <p role="alert" className="notes-error-message">
          {error}
        </p>
      )}

      {feedback && (
        <p role="status" className="notes-success-message">
          {feedback}
        </p>
      )}

      <div className="attachment-upload-section">
        <h2>Upload Attachment</h2>

        <p>
          Select an active note and a file. Maximum file size: 25 MB.
        </p>

        {notes.length === 0 ? (
          <p>Create an active note before uploading an attachment.</p>
        ) : (
          <div className="attachment-upload-controls">
            <select
              value={selectedNoteId}
              onChange={(event) =>
                setSelectedNoteId(event.target.value)
              }
              aria-label="Select note"
            >
              <option value="">Select a note</option>

              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title.trim() || t("untitledNote")}
                </option>
              ))}
            </select>

            <input
              id="attachment-file-input"
              type="file"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
            />

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !selectedNoteId}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        )}

        {selectedFile && (
          <p>
            Selected: {selectedFile.name} (
            {formatFileSize(selectedFile.size)})
          </p>
        )}
      </div>

      <div className="attachment-toolbar">
        <input
          type="search"
          placeholder="Search attachments..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search attachments"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as Category)
          }
          aria-label="Filter attachment category"
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value as "newest" | "oldest")
          }
          aria-label="Sort attachments"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        <button
          type="button"
          onClick={() => setView("grid")}
          aria-pressed={view === "grid"}
        >
          Grid
        </button>

        <button
          type="button"
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
        >
          List
        </button>
      </div>

      <p className="notes-results-count">
        {filteredAttachments.length} attachments
      </p>

      {filteredAttachments.length === 0 ? (
        <div className="notes-empty-state">
          <div className="notes-empty-icon">📎</div>

          <h2>No attachments found</h2>

          <p>
            Upload a file to one of your active notes to see it here.
          </p>

          <Link
            href="/dashboard"
            className="notes-primary-link"
          >
            {t("goToDashboard")}
          </Link>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "notes-list-grid"
              : "notes-list-grid attachment-list-view"
          }
        >
          {filteredAttachments.map((attachment) => {
            const fileCategory = getCategory(
              attachment.mimeType,
              attachment.fileName
            );

            return (
              <article
                className="notes-list-card attachment-card"
                key={attachment.id}
              >
                <div className="notes-list-card-top">
                  <h2 title={attachment.fileName}>
                    {attachment.fileName}
                  </h2>

                  <span className="notes-status-badge">
                    {categoryLabels[fileCategory]}
                  </span>
                </div>

                <div className="attachment-card-info">
                  <p className="attachment-file-meta">
                    {formatFileSize(attachment.sizeBytes)}
                  </p>

                  <p className="attachment-note-title">
                    Attached to: {attachment.noteTitle}
                  </p>

                  <p className="notes-card-date">
                    {new Date(
                      attachment.createdAt
                    ).toLocaleString(
                      language === "am" ? "am-ET" : "en-US"
                    )}
                  </p>
                </div>

                <div className="attachment-actions">
                  <button
                    type="button"
                    className="attachment-download"
                    onClick={() => handleDownload(attachment)}
                    disabled={downloadingId === attachment.id}
                  >
                    {downloadingId === attachment.id
                      ? "Downloading..."
                      : t("download")}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deletingId === attachment.id}
                  >
                    {deletingId === attachment.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}