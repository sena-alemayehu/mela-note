
"use client";

import { apiRequest } from "../../lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NoteEditor, { type Note } from "../../components/notes/NoteEditor";
import LanguageSwitcher from "../../components/language/LanguageSwitcher";
import ThemeToggle from "../../components/theme/ThemeToggle";
import { useLanguage } from "../../components/language/LanguageProvider";

import "../../styles/dashboard.css";
import "../../styles/notes.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function fixFileName(name: string) {
  try {
    return decodeURIComponent(escape(name));
  } catch {
    return name;
  }
}

function mapApiAttachment(apiAttachment: any) {
  return {
    id: String(apiAttachment.id),
    name: fixFileName(
      apiAttachment.fileName ?? apiAttachment.name ?? "Attachment"
    ),
    type: apiAttachment.mimeType ?? apiAttachment.type ?? "",
    size: Number(apiAttachment.sizeBytes ?? apiAttachment.size ?? 0),
    downloadUrl: apiAttachment.downloadUrl as string | undefined,
  };
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ViewerAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
};

function AttachmentViewer({
  title,
  items,
  apiBaseUrl,
  onClose,
  onDelete,
}: {
  title: string;
  items: ViewerAttachment[];
  apiBaseUrl: string;
  onClose: () => void;
  onDelete: (attachment: ViewerAttachment) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem("mela-note-access-token");
    const created: string[] = [];
    let cancelled = false;

    items.forEach(async (item) => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/attachments/${item.id}/download`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(String(response.status));
        }

        const blob = await response.blob();

        const typed = item.type
          ? blob.slice(0, blob.size, item.type)
          : blob;

        const url = URL.createObjectURL(typed);

        created.push(url);

        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        setUrls((previous) => ({
          ...previous,
          [item.id]: url,
        }));
      } catch {
        if (!cancelled) {
          setErrors((previous) => ({
            ...previous,
            [item.id]: true,
          }));
        }
      }
    });

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [items, apiBaseUrl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="attachment-viewer-backdrop"
      onClick={onClose}
    >
      <div
        className="attachment-viewer"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="attachment-viewer-header">
          <h3>{title}</h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="attachment-viewer-body">
          {items.map((item) => {
            const url = urls[item.id];

            const ext =
              item.name.split(".").pop()?.toLowerCase() ?? "";

            const isImage =
              item.type.startsWith("image/") ||
              ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);

            const isPdf =
              item.type === "application/pdf" || ext === "pdf";

            const isAudio = item.type.startsWith("audio/");
            const isVideo = item.type.startsWith("video/");

            return (
              <figure
                key={item.id}
                className="attachment-viewer-item"
              >
                <figcaption>
                  <strong>{item.name}</strong>
                  <small>{formatFileSize(item.size)}</small>
                </figcaption>

                {errors[item.id] ? (
                  <p className="attachment-viewer-note">
                    Could not load this file.
                  </p>
                ) : !url ? (
                  <p className="attachment-viewer-note">
                    Loading…
                  </p>
                ) : isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={item.name} />
                ) : isPdf ? (
                  <iframe src={url} title={item.name} />
                ) : isAudio ? (
                  <audio src={url} controls />
                ) : isVideo ? (
                  <video src={url} controls />
                ) : (
                  <p className="attachment-viewer-note">
                    No preview available for this file type.
                  </p>
                )}

                <div className="attachment-viewer-actions">
                  {url && (
                    <a
                      className="attachment-viewer-download"
                      href={url}
                      download={item.name}
                    >
                      Download
                    </a>
                  )}

                  <button
                    type="button"
                    className="attachment-viewer-delete"
                    disabled={deletingId === item.id}
                    onClick={async () => {
                      if (!window.confirm(`Delete "${item.name}"?`)) {
                        return;
                      }

                      setDeletingId(item.id);

                      try {
                        await onDelete(item);
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function mapApiNote(apiNote: any): Note {
  return {
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.content,
    type: apiNote.type ?? "TEXT",
    color: apiNote.color ?? "#FFFFFF",
    labels: Array.isArray(apiNote.labels)
      ? apiNote.labels
      : [],
    checklist: Array.isArray(apiNote.checklist)
      ? apiNote.checklist
      : [],
    updatedAt: apiNote.updatedAt,
    isPinned: apiNote.isPinned ?? false,
    isArchived: apiNote.status === "ARCHIVED",
    isTrashed: apiNote.status === "TRASHED",
    isFavorite: apiNote.isFavorite ?? false,
    attachments: Array.isArray(apiNote.attachments)
      ? apiNote.attachments.map(mapApiAttachment)
      : [],
  };
}

const copy = {
  en: {
    eyebrow: "YOUR PERSONAL WORKSPACE",
    greeting: "Good morning",
    subtitle: "Your thoughts deserve a beautiful place.",
    logout: "Sign out",
    dashboard: "Dashboard",
    notes: "My Notes",
    favorites: "Favorites",
    trash: "Trash",
    bannerLabel: "YOUR SPACE, YOUR IDEAS",
    bannerTitle: "Every great idea starts with a note.",
    bannerText:
      "Keep your thoughts, plans, and inspiration together in one place.",
    workspace: "Your workspace",
    workspaceText: "Everything you need to organize your thoughts.",
    noteDescription:
      "Write down ideas and keep important information together.",
    favoriteDescription:
      "Keep your most important thoughts close at hand.",
    attachments: "Attachments",
    attachmentsDescription:
      "A place for your files and useful resources.",
    quickAccess: "Quick access",
    comingNext: "Coming next",
    create: "Create note",
    recent: "Your notes",
    emptyTitle: "Your story starts here",
    emptyText:
      "Create your first note and give your ideas a place to grow.",
    untitled: "Untitled note",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this note?",
    search: "Search your notes...",
    noResults: "No notes match your search.",
    saved: "Your note has been saved.",
    loginRequired: "Please sign in first.",
    loading: "Loading your workspace...",
    noteCount: "notes",
    updated: "Updated",
    allNotes: "All Notes",
    favorite: "Add to favorites",
    unfavorite: "Remove from favorites",
    moveToTrash: "Move to Trash",
    restore: "Restore",
    deletePermanently: "Delete permanently",
    emptyFavorites: "You have no favorite notes yet.",
    emptyTrash: "Your Trash is empty.",
    confirmPermanentDelete:
      "Permanently delete this note? This action cannot be undone.",
    attachment: "attachment",
    attachmentSearch: "Search by file name or note",
    upload: "Upload",
    dropFiles: "Drag files here to attach, or",
    browse: "Browse",
    fileLimit: "Up to 25 MB per file",
    allFiles: "All",
    images: "Images",
    pdfs: "PDFs",
    documents: "Documents",
    audio: "Audio",
    newest: "Newest",
    oldest: "Oldest",
    gridView: "Grid view",
    listView: "List view",
    noAttachments: "No attachments yet",
    noAttachmentsDescription:
      "Attach files to your notes to see them here.",
    attachedTo: "Attached to",
    download: "Download",
  },

  am: {
    eyebrow: "የእርስዎ የግል የሥራ ቦታ",
    greeting: "እንደምን አደሩ",
    subtitle: "ሀሳቦችዎ የሚያምር ቦታ ይገባቸዋል።",
    logout: "ውጣ",
    dashboard: "ዋና ገጽ",
    notes: "ማስታወሻዎቼ",
    favorites: "ተወዳጆች",
    trash: "ቆሻሻ",
    bannerLabel: "የእርስዎ ቦታ፣ የእርስዎ ሀሳቦች",
    bannerTitle: "እያንዳንዱ ታላቅ ሀሳብ በማስታወሻ ይጀምራል።",
    bannerText:
      "ሀሳቦችዎን፣ ዕቅዶችዎን እና መነሳሻዎን በአንድ ቦታ ያስቀምጡ።",
    workspace: "የእርስዎ የሥራ ቦታ",
    workspaceText: "ሀሳቦችዎን ለማደራጀት የሚያስፈልግዎት ሁሉ።",
    noteDescription:
      "ሀሳቦችዎን ይጻፉና አስፈላጊ መረጃዎችን በአንድ ቦታ ያስቀምጡ።",
    favoriteDescription: "አስፈላጊ ሀሳቦችዎን በቀላሉ ያግኙ።",
    attachments: "የተያያዙ ፋይሎች",
    attachment: "ዓባሪ",
    attachmentsDescription:
      "ለፋይሎችዎና ለጠቃሚ ሀብቶችዎ የተዘጋጀ ቦታ።",
    quickAccess: "በቀላሉ ለማግኘት",
    comingNext: "በቅርቡ",
    create: "ማስታወሻ ይፍጠሩ",
    recent: "ማስታወሻዎችዎ",
    emptyTitle: "የእርስዎ ታሪክ እዚህ ይጀምራል",
    emptyText:
      "የመጀመሪያ ማስታወሻዎን ይፍጠሩና ሀሳቦችዎን ያሳድጉ።",
    untitled: "ርዕስ የሌለው ማስታወሻ",
    edit: "አርትዕ",
    delete: "ሰርዝ",
    confirmDelete: "ይህን ማስታወሻ ማጥፋት ይፈልጋሉ?",
    search: "ማስታወሻዎችዎን ይፈልጉ...",
    noResults: "ከፍለጋዎ ጋር የሚዛመድ ማስታወሻ የለም።",
    saved: "ማስታወሻዎ ተቀምጧል።",
    loginRequired: "እባክዎ መጀመሪያ ይግቡ።",
    loading: "የሥራ ቦታዎ በመጫን ላይ ነው...",
    noteCount: "ማስታወሻዎች",
    updated: "የተሻሻለበት",
    allNotes: "ሁሉም ማስታወሻዎች",
    favorite: "ወደ ተወዳጆች ጨምር",
    unfavorite: "ከተወዳጆች አስወግድ",
    moveToTrash: "ወደ መጣያ አዛውር",
    restore: "መልስ",
    deletePermanently: "ለዘላለም ሰርዝ",
    emptyFavorites: "ገና ተወዳጅ ማስታወሻዎች የሉዎትም።",
    emptyTrash: "መጣያው ባዶ ነው።",
    confirmPermanentDelete:
      "ይህን ማስታወሻ ለዘላለም መሰረዝ ይፈልጋሉ? ይህ እርምጃ መመለስ አይቻልም።",
    attachmentSearch: "በፋይል ስም ወይም በማስታወሻ ይፈልጉ",
    upload: "ጫን",
    dropFiles: "ፋይሎችን እዚህ ይጎትቱና ይልቀቁ፣ ወይም",
    browse: "ይምረጡ",
    fileLimit: "እስከ 25 MB በእያንዳንዱ ፋይል",
    allFiles: "ሁሉም",
    images: "ምስሎች",
    pdfs: "PDF ፋይሎች",
    documents: "ሰነዶች",
    audio: "ድምጽ",
    newest: "አዲስ የተጨመሩ",
    oldest: "አሮጌ የተጨመሩ",
    gridView: "የፍርግርግ እይታ",
    listView: "የዝርዝር እይታ",
    noAttachments: "ገና የተያያዙ ፋይሎች የሉም",
    noAttachmentsDescription:
      "እዚህ ለማየት ፋይሎችን ከማስታወሻዎችዎ ጋር ያያይዙ።",
    attachedTo: "የተያያዘው ከ",
    download: "አውርድ",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();

  // English fallback if the selected language is unavailable.
  const t = copy[language as keyof typeof copy] ?? copy.en;

  const [currentHour, setCurrentHour] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [accountName, setAccountName] = useState("User");

  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  const [viewer, setViewer] = useState<{
    title: string;
    items: ViewerAttachment[];
  } | null>(null);

  const [activeView, setActiveView] = useState<
    "all" | "favorites" | "trash" | "attachments"
  >("all");

  const [attachmentSearch, setAttachmentSearch] = useState("");

  const [attachmentFilter, setAttachmentFilter] = useState<
    "all" | "images" | "pdfs" | "documents" | "audio"
  >("all");

  const [attachmentLayout, setAttachmentLayout] = useState<
    "grid" | "list"
  >("grid");

  const [attachmentSort, setAttachmentSort] = useState<
    "newest" | "oldest"
  >("newest");

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const greeting = (() => {
    if (currentHour === null) {
      return "";
    }

    if (currentHour >= 5 && currentHour < 12) {
      return language === "am" ? "እንደምን አደሩ" : "Good morning";
    }

    if (currentHour >= 12 && currentHour < 17) {
      return language === "am" ? "እንደምን ዋሉ" : "Good afternoon";
    }

    if (currentHour >= 17 && currentHour < 21) {
      return language === "am" ? "እንደምን አመሹ" : "Good evening";
    }

    return language === "am" ? "መልካም ሌሊት" : "Good night";
  })();

  // Load dashboard data from backend.
  useEffect(() => {
    setCurrentHour(new Date().getHours());

    async function loadDashboard() {
      const token = localStorage.getItem("mela-note-access-token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const savedUser = localStorage.getItem("mela-note-user");

        if (savedUser) {
          const user = JSON.parse(savedUser);
          setAccountName(user.name || "User");
        }

        const response = await apiRequest<any[]>("/notes", token);

        setNotes(response.map(mapApiNote));
      } catch (error) {
        console.error("Dashboard loading error:", error);

        setFeedback(
          error instanceof Error
            ? error.message
            : "Unable to load notes."
        );
      } finally {
        setReady(true);
      }
    }

    loadDashboard();
  }, [router]);

  // Save note and upload pending attachments.
  const handleSave = async (note: Note) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const pendingFiles = (note.attachments ?? [])
        .map((attachment) => ({
          name: attachment.name,
          file: (
            attachment as typeof attachment & { file?: File }
          ).file,
        }))
        .filter(
          (attachment): attachment is { name: string; file: File } =>
            attachment.file instanceof File
        );

      const savedNote = editingNote
        ? await apiRequest<any>(
            `/notes/${editingNote.id}`,
            token,
            {
              method: "PATCH",
              body: JSON.stringify({
                title: note.title,
                content: note.content,
                type: note.type || "TEXT",
                color: note.color || "#FFFFFF",
                isPinned: note.isPinned || false,
                labels: note.labels || [],
                checklist: note.checklist || [],
              }),
            }
          )
        : await apiRequest<any>(
            "/notes",
            token,
            {
              method: "POST",
              body: JSON.stringify({
                title: note.title,
                content: note.content,
                type: note.type || "TEXT",
                color: note.color || "#FFFFFF",
                isPinned: note.isPinned || false,
                labels: note.labels || [],
                checklist: note.checklist || [],
              }),
            }
          );

      const mappedNote = mapApiNote(savedNote);

      if (!Array.isArray(savedNote.attachments) && editingNote) {
        mappedNote.attachments = editingNote.attachments ?? [];
      }

      const uploadedAttachments: ReturnType<
        typeof mapApiAttachment
      >[] = [];

      const failedUploads: string[] = [];

      for (const attachment of pendingFiles) {
        if (attachment.file.size > MAX_FILE_SIZE) {
          failedUploads.push(
            `${attachment.name} (larger than 25 MB)`
          );

          continue;
        }

        const formData = new FormData();

        formData.append("file", attachment.file);

        try {
          const response = await fetch(
            `${API_BASE_URL}/attachments/notes/${savedNote.id}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            throw new Error(
              errorData?.message ||
                `Upload failed (${response.status})`
            );
          }

          const uploaded = await response.json();

          uploadedAttachments.push(mapApiAttachment(uploaded));
        } catch (uploadError) {
          console.error(
            `Attachment upload failed: ${attachment.name}`,
            uploadError
          );

          failedUploads.push(attachment.name);
        }
      }

      mappedNote.attachments = [
        ...(mappedNote.attachments ?? []),
        ...uploadedAttachments,
      ];

      setNotes((previous) =>
        editingNote
          ? previous.map((item) =>
              item.id === mappedNote.id ? mappedNote : item
            )
          : [mappedNote, ...previous]
      );

      setEditingNote(null);
      setEditorOpen(false);

      if (failedUploads.length > 0) {
        setFeedback(
          `Note saved, but these attachments could not be uploaded: ${failedUploads.join(
            ", "
          )}.`
        );
      } else if (pendingFiles.length > 0) {
        setFeedback(
          `Note saved and ${pendingFiles.length} attachment(s) uploaded successfully.`
        );
      } else {
        setFeedback("Note saved successfully.");
      }
    } catch (error) {
      console.error("Saving note failed:", error);

      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to save note."
      );
    }
  };

  // Move note to Trash.
  const handleDelete = async (noteId: string) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) return;

    try {
      await apiRequest(`/notes/${noteId}/trash`, token, {
        method: "PATCH",
      });

      setNotes((previous) =>
        previous.map((note) =>
          note.id === noteId
            ? { ...note, isTrashed: true }
            : note
        )
      );

      setFeedback("Note moved to Trash.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to delete note."
      );
    }
  };

  // Toggle favorite.
  const handleToggleFavorite = async (noteId: string) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    const selectedNote = notes.find(
      (note) => note.id === noteId
    );

    if (!selectedNote) return;

    try {
      const updatedNote = await apiRequest<any>(
        `/notes/${noteId}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            isFavorite: !selectedNote.isFavorite,
          }),
        }
      );

      const mappedNote = mapApiNote(updatedNote);

      setNotes((previous) =>
        previous.map((note) =>
          note.id === noteId ? mappedNote : note
        )
      );

      setFeedback(
        mappedNote.isFavorite
          ? "Note added to Favorites."
          : "Note removed from Favorites."
      );
    } catch (error) {
      console.error("Favorite update failed:", error);

      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to update favorite."
      );
    }
  };

  // Toggle pinned status.
  const handleTogglePinned = async (noteId: string) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) return;

    const selectedNote = notes.find(
      (note) => note.id === noteId
    );

    if (!selectedNote) return;

    try {
      const updatedNote = await apiRequest<any>(
        `/notes/${noteId}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            isPinned: !selectedNote.isPinned,
          }),
        }
      );

      const mappedNote = mapApiNote(updatedNote);

      setNotes((previous) =>
        previous.map((note) =>
          note.id === noteId ? mappedNote : note
        )
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to pin note."
      );
    }
  };

  // Archive note.
  const handleArchive = async (noteId: string) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) return;

    try {
      await apiRequest(`/notes/${noteId}/archive`, token, {
        method: "PATCH",
      });

      setNotes((previous) =>
        previous.map((note) =>
          note.id === noteId
            ? { ...note, isArchived: true }
            : note
        )
      );

      setFeedback("Note archived successfully.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to archive note."
      );
    }
  };

  // Restore note.
  function handleRestore(noteId: string) {
    // Backend restore endpoint should be confirmed before
    // replacing this local operation with an API request.
    const updatedNotes = notes.map((note) =>
      note.id === noteId
        ? { ...note, isTrashed: false }
        : note
    );

    setNotes(updatedNotes);
  }

  // Permanently delete note.
  function handleDeletePermanently(noteId: string) {
    if (!window.confirm(t.confirmPermanentDelete)) {
      return;
    }

    // Backend permanent-delete endpoint should be confirmed
    // before replacing this local operation with an API request.
    const updatedNotes = notes.filter(
      (note) => note.id !== noteId
    );

    setNotes(updatedNotes);
  }

  function openNewNote() {
    setEditingNote(null);
    setEditorOpen(true);
    setFeedback("");
  }

  function openEditNote(note: Note) {
    setEditingNote(note);
    setEditorOpen(true);
    setFeedback("");
  }

  // Autosave existing notes.
  const handleAutosave = async (note: Note) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token || !note.id) return;

    try {
      const updated = await apiRequest<any>(
        `/notes/${note.id}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            type: note.type || "TEXT",
            color: note.color || "#FFFFFF",
            isPinned: note.isPinned || false,
            labels: note.labels || [],
            checklist: note.checklist || [],
          }),
        }
      );

      const mapped = mapApiNote(updated);

      setNotes((previous) =>
        previous.map((item) =>
          item.id === mapped.id
            ? {
                ...mapped,
                attachments:
                  mapped.attachments?.length
                    ? mapped.attachments
                    : item.attachments,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Autosave error:", error);
    }
  };

  const allLabels = Array.from(
    new Set(
      notes.flatMap((note) => note.labels ?? [])
    )
  ).filter(Boolean);

  const filteredNotes = notes.filter((note) => {
    if (activeView === "trash") {
      return note.isTrashed === true;
    }

    if (
      note.isTrashed === true ||
      note.isArchived === true
    ) {
      return false;
    }

    if (
      activeView === "favorites" &&
      !note.isFavorite
    ) {
      return false;
    }

    if (
      selectedLabel &&
      !(note.labels ?? []).includes(selectedLabel)
    ) {
      return false;
    }

    const query = search.trim().toLowerCase();

    if (!query) return true;

    const matchesTitle = (note.title || "")
      .toLowerCase()
      .includes(query);

    const matchesContent = (note.content || "")
      .toLowerCase()
      .includes(query);

    const matchesLabels = (note.labels ?? []).some((label) =>
      label.toLowerCase().includes(query)
    );

    const matchesChecklist = (note.checklist ?? []).some(
      (item) => item.text.toLowerCase().includes(query)
    );

    return (
      matchesTitle ||
      matchesContent ||
      matchesLabels ||
      matchesChecklist
    );
  });

  // Download attachment.
  const handleDownloadAttachment = async (
    attachment: {
      id: string;
      name: string;
      downloadUrl?: string;
    }
  ) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const url = `${API_BASE_URL}/attachments/${attachment.id}/download`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Download failed (${response.status})`
        );
      }

      const blobUrl = URL.createObjectURL(
        await response.blob()
      );

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = attachment.name;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Attachment download failed:", error);

      setFeedback("Could not download this attachment.");
    }
  };

  // Delete attachment.
  const handleDeleteAttachment = async (
    attachment: ViewerAttachment
  ) => {
    const token = localStorage.getItem("mela-note-access-token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/attachments/${attachment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Delete failed (${response.status})`
        );
      }

      setNotes((previous) =>
        previous.map((note) => ({
          ...note,
          attachments: (note.attachments ?? []).filter(
            (item) => item.id !== attachment.id
          ),
        }))
      );

      setViewer((current) => {
        if (!current) return current;

        const items = current.items.filter(
          (item) => item.id !== attachment.id
        );

        return items.length === 0
          ? null
          : { ...current, items };
      });

      setFeedback("Attachment deleted.");
    } catch (error) {
      console.error("Attachment delete failed:", error);

      setFeedback("Could not delete this attachment.");
    }
  };

  const allAttachments = notes
    .filter((note) => !note.isTrashed)
    .flatMap((note) =>
      (note.attachments ?? []).map((attachment) => ({
        ...attachment,
        noteId: note.id,
        noteTitle: note.title || t.untitled,
        noteUpdatedAt: note.updatedAt,
      }))
    );

  function getAttachmentCategory(
    type: string,
    name: string
  ) {
    const extension =
      name.split(".").pop()?.toLowerCase() ?? "";

    if (type.startsWith("image/")) {
      return "images";
    }

    if (
      type === "application/pdf" ||
      extension === "pdf"
    ) {
      return "pdfs";
    }

    if (
      type.startsWith("audio/") ||
      [
        "mp3",
        "wav",
        "m4a",
        "ogg",
        "aac",
        "flac",
      ].includes(extension)
    ) {
      return "audio";
    }

    if (
      type.includes("document") ||
      type.includes("word") ||
      type.includes("spreadsheet") ||
      type.includes("presentation") ||
      [
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "rtf",
        "csv",
      ].includes(extension)
    ) {
      return "documents";
    }

    return "other";
  }

  const filteredAttachments = allAttachments
    .filter((attachment) => {
      const query = attachmentSearch.trim().toLowerCase();

      const matchesSearch =
        attachment.name.toLowerCase().includes(query) ||
        attachment.noteTitle.toLowerCase().includes(query);

      const category = getAttachmentCategory(
        attachment.type,
        attachment.name
      );

      const matchesFilter =
        attachmentFilter === "all" ||
        category === attachmentFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const difference =
        new Date(a.noteUpdatedAt).getTime() -
        new Date(b.noteUpdatedAt).getTime();

      return attachmentSort === "newest"
        ? -difference
        : difference;
    });

  if (!ready) {
    return (
      <main className="dashboard-loading">
        {t.loading}
      </main>
    );
  }

  return (
    <>
      <section className="dashboard-main">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              {t.eyebrow}
            </p>

            <h1>
              {greeting
                ? `${greeting}, ${accountName}!`
                : `${accountName}!`}
            </h1>

            <p className="dashboard-subtitle">
              {t.subtitle}
            </p>
          </div>

          <div className="dashboard-header-actions">
            <LanguageSwitcher />

            <ThemeToggle className="header-theme-toggle" />

            <div className="dashboard-avatar">
              {accountName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="dashboard-welcome-card">
          <div>
            <span className="dashboard-card-label">
              {t.bannerLabel}
            </span>

            <h2>{t.bannerTitle}</h2>

            <p>{t.bannerText}</p>

            <button
              className="dashboard-create-button"
              type="button"
              onClick={openNewNote}
            >
              + {t.create}
            </button>
          </div>

          <div
            className="dashboard-illustration"
            aria-hidden="true"
          >
            ✎
          </div>
        </section>

        {/* Workspace Features */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h2>{t.workspace}</h2>
            <p>{t.workspaceText}</p>
          </div>

          <div className="dashboard-feature-grid">
            <button
              className="dashboard-feature-card dashboard-feature-button"
              type="button"
              onClick={() => {
                setActiveView("favorites");

                document
                  .getElementById("my-notes")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              <div className="dashboard-feature-icon yellow">
                ☆
              </div>

              <h3>{t.favorites}</h3>

              <p>{t.favoriteDescription}</p>

              <span>{t.quickAccess} →</span>
            </button>

            <button
              className="dashboard-feature-card dashboard-feature-button"
              type="button"
              onClick={() => {
                setActiveView("all");

                document
                  .getElementById("my-notes")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              <div className="dashboard-feature-icon purple">
                ▤
              </div>

              <h3>{t.notes}</h3>

              <p>{t.noteDescription}</p>

              <span>
                {
                  notes.filter((note) => !note.isTrashed)
                    .length
                }{" "}
                {t.noteCount} →
              </span>
            </button>

            <button
              className="dashboard-feature-card dashboard-feature-button"
              type="button"
              onClick={() => {
                setActiveView("attachments");

                document
                  .getElementById("my-notes")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              <div className="dashboard-feature-icon blue">
                ⌁
              </div>

              <h3>{t.attachments}</h3>

              <p>{t.attachmentsDescription}</p>

              <span>
                {notes.reduce(
                  (total, note) =>
                    total +
                    (note.isTrashed
                      ? 0
                      : note.attachments?.length ?? 0),
                  0
                )}{" "}
                {t.attachments} →
              </span>
            </button>
          </div>
        </section>

        {/* Notes and Attachments */}
        <section
          className="dashboard-notes-section"
          id="my-notes"
        >
          <div className="dashboard-notes-heading">
            <div>
              <h2>{t.recent}</h2>

              <p>
                {notes.length} {t.noteCount}
              </p>
            </div>

            <button
              className="dashboard-create-button"
              type="button"
              onClick={openNewNote}
            >
              + {t.create}
            </button>
          </div>

          <input
            className="dashboard-note-search"
            type="search"
            placeholder={t.search}
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {/* Label Filters */}
          {allLabels.length > 0 &&
            activeView !== "attachments" && (
              <div className="dashboard-label-filters">
                <button
                  type="button"
                  className={`dashboard-label-chip ${
                    selectedLabel === null ? "active" : ""
                  }`}
                  onClick={() => setSelectedLabel(null)}
                >
                  {t.allNotes || "All"}
                </button>

                {allLabels.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`dashboard-label-chip ${
                      selectedLabel === tag ? "active" : ""
                    }`}
                    onClick={() =>
                      setSelectedLabel(
                        selectedLabel === tag ? null : tag
                      )
                    }
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

          {feedback && (
            <p
              className="dashboard-feedback"
              role="status"
            >
              {feedback}
            </p>
          )}

          {/* Attachments View */}
          {activeView === "attachments" ? (
            filteredAttachments.length === 0 ? (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">
                  📎
                </div>

                <h2>{t.noAttachments}</h2>

                <p>{t.noAttachmentsDescription}</p>
              </div>
            ) : (
              <div className="dashboard-attachment-list">
                {filteredAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="dashboard-attachment-item"
                  >
                    <span className="dashboard-attachment-icon">
                      📎
                    </span>

                    <div className="dashboard-attachment-info">
                      <strong>{attachment.name}</strong>

                      <small>
                        {formatFileSize(attachment.size)} ·{" "}
                        {attachment.noteTitle}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="dashboard-attachment-download"
                      onClick={() =>
                        setViewer({
                          title: attachment.noteTitle,
                          items: [attachment],
                        })
                      }
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="dashboard-attachment-download"
                      onClick={() =>
                        handleDownloadAttachment(attachment)
                      }
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : filteredNotes.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-icon">
                ✧
              </div>

              <h2>
                {activeView === "trash"
                  ? t.emptyTrash
                  : activeView === "favorites"
                    ? t.emptyFavorites
                    : search.trim()
                      ? t.noResults
                      : t.emptyTitle}
              </h2>

              <p>
                {activeView === "trash"
                  ? t.emptyTrash
                  : activeView === "favorites"
                    ? t.emptyFavorites
                    : search.trim()
                      ? t.noResults
                      : t.emptyText}
              </p>

              {activeView === "all" &&
                !search.trim() && (
                  <button
                    className="dashboard-create-button"
                    type="button"
                    onClick={openNewNote}
                  >
                    + {t.create}
                  </button>
                )}
            </div>
          ) : (
            <div className="dashboard-note-grid">
              {filteredNotes.map((note) => (
                <article
                  className={`dashboard-note-card ${
                    note.isPinned ? "is-pinned" : ""
                  }`}
                  key={note.id}
                  style={{
                    backgroundColor:
                      note.color && note.color !== "#FFFFFF"
                        ? note.color
                        : undefined,
                  }}
                >
                  <div className="dashboard-note-card-top">
                    <h3>{note.title || t.untitled}</h3>

                    {note.isPinned && (
                      <span
                        className="dashboard-card-pin-badge"
                        title="Pinned"
                      >
                        📌
                      </span>
                    )}
                  </div>

                  {/* Checklist or Text Preview */}
                  {note.type === "CHECKLIST" &&
                  Array.isArray(note.checklist) &&
                  note.checklist.length > 0 ? (
                    <div className="dashboard-note-checklist-preview">
                      {note.checklist
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`checklist-preview-line ${
                              item.completed ? "done" : ""
                            }`}
                          >
                            <span>
                              {item.completed ? "☑" : "☐"}
                            </span>

                            <span>{item.text}</span>
                          </div>
                        ))}

                      {note.checklist.length > 3 && (
                        <small className="checklist-preview-more">
                          +{note.checklist.length - 3} more items
                        </small>
                      )}
                    </div>
                  ) : (
                    <p>{note.content || "—"}</p>
                  )}

                  {/* Labels */}
                  {note.labels && note.labels.length > 0 && (
                    <div className="dashboard-note-card-labels">
                      {note.labels.map((tag) => (
                        <span
                          key={tag}
                          className="dashboard-note-card-tag"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Note Attachments */}
                  {note.attachments &&
                    note.attachments.length > 0 && (
                      <button
                        type="button"
                        className="note-card-attachments"
                        onClick={() =>
                          setViewer({
                            title: note.title || t.untitled,
                            items: note.attachments ?? [],
                          })
                        }
                      >
                        <span aria-hidden="true">📎</span>{" "}

                        {note.attachments.length}{" "}

                        {note.attachments.length === 1
                          ? t.attachment
                          : t.attachments}
                      </button>
                    )}

                  <small>
                    {t.updated}:{" "}
                    {new Date(
                      note.updatedAt
                    ).toLocaleDateString(
                      language === "am" ? "am-ET" : "en-US"
                    )}
                  </small>

                  {/* Note Actions */}
                  <div className="dashboard-note-actions">
                    {activeView === "trash" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleRestore(note.id)
                          }
                        >
                          {t.restore}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePermanently(note.id)
                          }
                        >
                          {t.deletePermanently}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            openEditNote(note)
                          }
                        >
                          {t.edit}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleFavorite(note.id)
                          }
                        >
                          {note.isFavorite
                            ? t.unfavorite
                            : t.favorite}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleTogglePinned(note.id)
                          }
                          aria-label={
                            note.isPinned
                              ? "Unpin note"
                              : "Pin note"
                          }
                        >
                          {note.isPinned
                            ? "📌 Unpin"
                            : "📌 Pin"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleArchive(note.id)
                          }
                          aria-label="Archive note"
                        >
                          ▣ Archive
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(note.id)
                          }
                        >
                          {t.moveToTrash}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {/* Attachment Viewer */}
      {viewer && (
        <AttachmentViewer
          title={viewer.title}
          items={viewer.items}
          apiBaseUrl={API_BASE_URL}
          onClose={() => setViewer(null)}
          onDelete={handleDeleteAttachment}
        />
      )}

      {/* Note Editor */}
      {editorOpen && (
        <NoteEditor
          note={editingNote}
          onSave={handleSave}
          onAutosave={handleAutosave}
          onCancel={() => {
            setEditorOpen(false);
            setEditingNote(null);
          }}
        />
      )}
    </>
  );
}
