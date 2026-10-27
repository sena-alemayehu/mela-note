
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NoteEditor, { type Note } from "../../components/notes/NoteEditor";
import LanguageSwitcher from "../../components/language/LanguageSwitcher";
import { useLanguage } from "../../components/language/LanguageProvider";
import "../../styles/dashboard.css";
import "../../styles/notes.css";

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
    bannerText: "Keep your thoughts, plans, and inspiration together in one place.",
    workspace: "Your workspace",
    workspaceText: "Everything you need to organize your thoughts.",
    noteDescription: "Write down ideas and keep important information together.",
    favoriteDescription: "Keep your most important thoughts close at hand.",
    attachments: "Attachments",
    attachmentsDescription: "A place for your files and useful resources.",
    quickAccess: "Quick access",
    comingNext: "Coming next",
    create: "Create note",
    recent: "Your notes",
    emptyTitle: "Your story starts here",
    emptyText: "Create your first note and give your ideas a place to grow.",
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
    bannerText: "ሀሳቦችዎን፣ ዕቅዶችዎን እና መነሳሻዎን በአንድ ቦታ ያስቀምጡ።",
    workspace: "የእርስዎ የሥራ ቦታ",
    workspaceText: "ሀሳቦችዎን ለማደራጀት የሚያስፈልግዎት ሁሉ።",
    noteDescription: "ሀሳቦችዎን ይጻፉና አስፈላጊ መረጃዎችን በአንድ ቦታ ያስቀምጡ።",
    favoriteDescription: "አስፈላጊ ሀሳቦችዎን በቀላሉ ያግኙ።",
    attachments: "የተያያዙ ፋይሎች",
    attachmentsDescription: "ለፋይሎችዎና ለጠቃሚ ሀብቶችዎ የተዘጋጀ ቦታ።",
    quickAccess: "በቀላሉ ለማግኘት",
    comingNext: "በቅርቡ",
    create: "ማስታወሻ ይፍጠሩ",
    recent: "ማስታወሻዎችዎ",
    emptyTitle: "የእርስዎ ታሪክ እዚህ ይጀምራል",
    emptyText: "የመጀመሪያ ማስታወሻዎን ይፍጠሩና ሀሳቦችዎን ያሳድጉ።",
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
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language];

  const [ready, setReady] = useState(false);
  const [accountName, setAccountName] = useState("User");
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  const storageKey = "mela-note-demo-notes";
  
  
const [activeView, setActiveView] = useState<
  "all" | "favorites" | "trash"
>("all");
  useEffect(() => {
    const authenticated = sessionStorage.getItem(
      "mela-note-demo-authenticated"
    );
    const savedAccount = sessionStorage.getItem("mela-note-demo-account");

    if (authenticated !== "true" || !savedAccount) {
      router.replace("/login");
      return;
    }

    try {
      const account = JSON.parse(savedAccount);
      setAccountName(account.name || "User");

      const savedNotes = localStorage.getItem(storageKey);
      if (savedNotes) {
        const parsed: unknown = JSON.parse(savedNotes);
        if (Array.isArray(parsed)) {
          setNotes(parsed as Note[]);
        }
      }

      setReady(true);
    } catch {
      sessionStorage.removeItem("mela-note-demo-authenticated");
      router.replace("/login");
    }
  }, [router]);

  function handleSave(note: Note) {
    const updatedNotes = [
      note,
      ...notes.filter((item) => item.id !== note.id),
    ];

    setNotes(updatedNotes);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    setEditorOpen(false);
    setEditingNote(null);
    setFeedback(t.saved);
  }

 function handleDelete(noteId: string) {
  const updatedNotes = notes.map((note) =>
    note.id === noteId
      ? { ...note, isTrashed: true }
      : note
  );

  setNotes(updatedNotes);
  localStorage.setItem(
    "mela-note-demo-notes",
    JSON.stringify(updatedNotes)
  );
}

function handleToggleFavorite(noteId: string) {
  const updatedNotes = notes.map((note) =>
    note.id === noteId
      ? { ...note, isFavorite: !note.isFavorite }
      : note
  );

  setNotes(updatedNotes);
  localStorage.setItem(
    "mela-note-demo-notes",
    JSON.stringify(updatedNotes)
  );
}

function handleRestore(noteId: string) {
  const updatedNotes = notes.map((note) =>
    note.id === noteId
      ? { ...note, isTrashed: false }
      : note
  );

  setNotes(updatedNotes);
  localStorage.setItem(
    "mela-note-demo-notes",
    JSON.stringify(updatedNotes)
  );
}

function handleDeletePermanently(noteId: string) {
  if (!window.confirm(t.confirmPermanentDelete)) {
    return;
  }

  const updatedNotes = notes.filter(
    (note) => note.id !== noteId
  );

  setNotes(updatedNotes);
  localStorage.setItem(
    "mela-note-demo-notes",
    JSON.stringify(updatedNotes)
  );
}

  function handleLogout() {
    sessionStorage.removeItem("mela-note-demo-authenticated");
    router.replace("/login");
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

  
const filteredNotes = notes.filter((note) => {

  if (activeView === "trash") {
    return note.isTrashed === true;
  }

 
  if (note.isTrashed === true) {
    return false;
  }


  if (activeView === "favorites" && !note.isFavorite) {
    return false;
  }


  const query = search.trim().toLowerCase();

  return (
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query)
  );
});


  if (!ready) {
    return <main className="dashboard-loading">{t.loading}</main>;
  }



  return (
    <main className="dashboard-page" lang={language}>
      <aside className="dashboard-sidebar">
        <Link href="/dashboard" className="dashboard-logo">
          Mela <strong>Note</strong>
        </Link>

        <nav className="dashboard-nav">
          <Link href="/dashboard" className="dashboard-nav-link active">
            <span>⌂</span> {t.dashboard}
          </Link>
         
<button
  className={`dashboard-nav-link ${
    activeView === "all" ? "active" : ""
  }`}
  type="button"
  onClick={() => {
    setActiveView("all");
    document.getElementById("my-notes")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  <span>▤</span> {t.allNotes}
</button>

          
<button
  className={`dashboard-nav-link ${
    activeView === "favorites" ? "active" : ""
  }`}
  type="button"
  onClick={() => setActiveView("favorites")}
>
  <span>☆</span> {t.favorites}
</button>

<button
  className={`dashboard-nav-link ${
    activeView === "trash" ? "active" : ""
  }`}
  type="button"
  onClick={() => setActiveView("trash")}
>
  <span>⌫</span> {t.trash}
</button>

        </nav>

        <button
          className="dashboard-logout"
          type="button"
          onClick={handleLogout}
        >
          ↪ {t.logout}
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{t.eyebrow}</p>
            <h1>
              {t.greeting}, {accountName}!
            </h1>
            <p className="dashboard-subtitle">{t.subtitle}</p>
          </div>

          <div className="dashboard-header-actions">
            <LanguageSwitcher />
            <div className="dashboard-avatar">
              {accountName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="dashboard-welcome-card">
          <div>
            <span className="dashboard-card-label">{t.bannerLabel}</span>
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

          <div className="dashboard-illustration" aria-hidden="true">
            ✎
          </div>
        </section>

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
    document.getElementById("my-notes")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  <div className="dashboard-feature-icon yellow">☆</div>
  <h3>{t.favorites}</h3>
  <p>{t.favoriteDescription}</p>
  <span>{t.quickAccess} →</span>
</button>


            
<button
  className="dashboard-feature-card dashboard-feature-button"
  type="button"
  onClick={() => {
    setActiveView("all");
    document.getElementById("my-notes")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  <div className="dashboard-feature-icon purple">▤</div>
  <h3>{t.notes}</h3>
  <p>{t.noteDescription}</p>
  <span>{notes.filter((note) => !note.isTrashed).length} {t.noteCount} →</span>
</button>


            <article className="dashboard-feature-card">
              <div className="dashboard-feature-icon blue">⌁</div>
              <h3>{t.attachments}</h3>
              <p>{t.attachmentsDescription}</p>
              <span>{t.comingNext}</span>
            </article>
          </div>
        </section>

        <section className="dashboard-notes-section" id="my-notes">
          <div className="dashboard-notes-heading">
            <div>
              <h2>{t.recent}</h2>
              <p>{notes.length} {t.noteCount}</p>
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
            onChange={(event) => setSearch(event.target.value)}
          />

          {feedback && (
            <p className="dashboard-feedback" role="status">
              {feedback}
            </p>
          )}


{filteredNotes.length === 0 ? (
  <div className="dashboard-empty-state">
    <div className="dashboard-empty-icon">✧</div>

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

    {activeView === "all" && !search.trim() && (
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
      <article className="dashboard-note-card" key={note.id}>
        <h3>{note.title || t.untitled}</h3>
        <p>{note.content || "—"}</p>

        <small>
          {t.updated}:{" "}
          {new Date(note.updatedAt).toLocaleDateString(
            language === "am" ? "am-ET" : "en-US"
          )}
        </small>

        <div className="dashboard-note-actions">
          {activeView === "trash" ? (
            <>
              <button
                type="button"
                onClick={() => handleRestore(note.id)}
              >
                {t.restore}
              </button>

              <button
                type="button"
                onClick={() => handleDeletePermanently(note.id)}
              >
                {t.deletePermanently}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openEditNote(note)}
              >
                {t.edit}
              </button>

              <button
                type="button"
                onClick={() => handleToggleFavorite(note.id)}
              >
                {note.isFavorite ? t.unfavorite : t.favorite}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(note.id)}
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

      {editorOpen && (
        <NoteEditor
          note={editingNote}
          onSave={handleSave}
          onCancel={() => {
            setEditorOpen(false);
            setEditingNote(null);
          }}
        />
      )}
    </main>
  );
}
