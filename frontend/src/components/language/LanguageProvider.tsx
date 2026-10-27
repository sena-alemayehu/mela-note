"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "am";

const translations = {
  en: {
    loadingNotes: "Loading notes...",
    loadingPinned: "Loading pinned notes...",
    loadingFavorites: "Loading favorites...",
    loadingAttachments: "Loading attachments...",
    loadingArchive: "Loading archive...",
    loadingTrash: "Loading trash...",

    workspace: "YOUR WORKSPACE",
    allNotes: "All Notes",
    allNotesDescription: "Find and review all your active notes in one place.",
    quickAccess: "QUICK ACCESS",
    pinnedNotes: "Pinned Notes",
    pinnedDescription: "Keep your most important notes easy to find.",
    yourCollection: "YOUR COLLECTION",
    favorites: "Favorites",
    favoritesDescription: "Find the notes you have marked as your favorites.",
    fileLibrary: "YOUR FILE LIBRARY",
    attachments: "Attachments",
    attachmentsDescription: "Find files attached to your active notes.",
    archive: "Archive",
    archiveDescription: "Keep notes you want to save outside your active workspace.",
    recoverOrDelete: "RECOVER OR DELETE",
    trash: "Trash",
    trashDescription: "Restore notes or permanently delete the ones you no longer need.",

    dashboard: "Dashboard",
    backToDashboard: "← Dashboard",
    searchNotes: "Search your notes...",
    searchAttachments: "Search files or note titles...",
    searchNotesLabel: "Search notes",
    searchAttachmentsLabel: "Search attachments",
    note: "note",
    notes: "notes",
    pinnedNote: "pinned note",
    pinnedNotesCount: "pinned notes",
    favoriteNote: "favorite note",
    favoriteNotes: "favorite notes",
    archivedNote: "archived note",
    archivedNotes: "archived notes",

    noMatchingNotes: "No matching notes",
    noNotesYet: "No notes yet",
    tryDifferentSearch: "Try a different search term.",
    createFirstNote: "Create your first note from the dashboard to see it here.",
    noPinnedNotes: "No pinned notes yet",
    pinImportantNotes: "Pin important notes to make them appear here. Your existing notes are safe.",
    noFavorites: "No favorites yet",
    markFavorite: "Mark a note as a favorite from your dashboard, and it will appear here.",
    emptyArchive: "Your archive is empty",
    archiveExplanation: "When you archive a note, it will appear here. Archiving does not permanently delete your note.",
    emptyTrash: "Your Trash is empty",
    trashExplanation: "Notes you move to Trash will appear here.",
    untitledNote: "Untitled note",
    noText: "This note has no text yet.",
    noTextContent: "This note has no text content.",
    updated: "Updated",
    recently: "recently",
    goToDashboard: "Go to Dashboard",
    pinned: "Pinned",
    favorite: "Favorite",
    archived: "Archived",
    inTrash: "In Trash",
    restore: "Restore",
    restoreActive: "Restore to active notes",
    permanentlyDelete: "Permanently Delete",
    lastUpdated: "Last updated:",
    confirmPermanentDelete: "Are you sure you want to permanently delete this note? This action cannot be undone.",

    allFileTypes: "All file types",
    images: "Images",
    pdfFiles: "PDF files",
    documents: "Documents",
    audio: "Audio",
    otherFiles: "Other files",
    newestFirst: "Newest first",
    oldestFirst: "Oldest first",
    grid: "Grid",
    list: "List",
    filterAttachments: "Filter attachments by type",
    sortAttachments: "Sort attachments",
    showing: "Showing",
    of: "of",
    files: "files",
    noMatchingAttachments: "No matching attachments",
    noAttachments: "No attachments yet",
    tryAnotherFilter: "Try another search term or file type.",
    attachFiles: "Attach files to your notes and they will appear here.",
    attachedTo: "Attached to:",
    download: "Download",
    fileUnavailable: "File unavailable",
    previewAttachment: "Preview attachment",
    chooseLanguage: "Choose language",
  },

  am: {
    loadingNotes: "ማስታወሻዎች በመጫን ላይ...",
    loadingPinned: "የተሰኩ ማስታወሻዎች በመጫን ላይ...",
    loadingFavorites: "ተወዳጅ ማስታወሻዎች በመጫን ላይ...",
    loadingAttachments: "የተያያዙ ፋይሎች በመጫን ላይ...",
    loadingArchive: "ማህደሩ በመጫን ላይ...",
    loadingTrash: "የተሰረዙ ማስታወሻዎች በመጫን ላይ...",

    workspace: "የሥራ ቦታዎ",
    allNotes: "ሁሉም ማስታወሻዎች",
    allNotesDescription: "ሁሉንም ንቁ ማስታወሻዎችዎን እዚህ ይመልከቱ እና ይፈልጉ።",
    quickAccess: "ፈጣን መዳረሻ",
    pinnedNotes: "የተሰኩ ማስታወሻዎች",
    pinnedDescription: "አስፈላጊ የሆኑ ማስታወሻዎችዎን በቀላሉ ያግኙ።",
    yourCollection: "የእርስዎ ስብስብ",
    favorites: "ተወዳጆች",
    favoritesDescription: "እንደ ተወዳጅ የመረጧቸውን ማስታወሻዎች እዚህ ያግኙ።",
    fileLibrary: "የፋይሎች ስብስብ",
    attachments: "የተያያዙ ፋይሎች",
    attachmentsDescription: "ከንቁ ማስታወሻዎችዎ ጋር የተያያዙ ፋይሎችን ያግኙ።",
    archive: "ማህደር",
    archiveDescription: "ከዋናው የሥራ ቦታ ውጭ ማስቀመጥ የሚፈልጓቸውን ማስታወሻዎች እዚህ ያቆዩ።",
    recoverOrDelete: "መልሶ ማግኘት ወይም መሰረዝ",
    trash: "መጣያ",
    trashDescription: "ማስታወሻዎችን መልሰው ያግኙ ወይም ከአሁን በኋላ የማያስፈልጓቸውን ለዘላለም ይሰርዙ።",

    dashboard: "ዳሽቦርድ",
    backToDashboard: "← ወደ ዳሽቦርድ",
    searchNotes: "ማስታወሻዎችን ይፈልጉ...",
    searchAttachments: "ፋይሎችን ወይም የማስታወሻ ርዕሶችን ይፈልጉ...",
    searchNotesLabel: "ማስታወሻዎችን ይፈልጉ",
    searchAttachmentsLabel: "የተያያዙ ፋይሎችን ይፈልጉ",
    note: "ማስታወሻ",
    notes: "ማስታወሻዎች",
    pinnedNote: "የተሰካ ማስታወሻ",
    pinnedNotesCount: "የተሰኩ ማስታወሻዎች",
    favoriteNote: "ተወዳጅ ማስታወሻ",
    favoriteNotes: "ተወዳጅ ማስታወሻዎች",
    archivedNote: "የተመዘገበ ማስታወሻ",
    archivedNotes: "የተመዘገቡ ማስታወሻዎች",

    noMatchingNotes: "የሚዛመድ ማስታወሻ አልተገኘም",
    noNotesYet: "እስካሁን ማስታወሻ የለም",
    tryDifferentSearch: "ሌላ የፍለጋ ቃል ይሞክሩ።",
    createFirstNote: "የመጀመሪያዎን ማስታወሻ ከዳሽቦርዱ ይፍጠሩ።",
    noPinnedNotes: "እስካሁን የተሰካ ማስታወሻ የለም",
    pinImportantNotes: "አስፈላጊ ማስታወሻዎችን እዚህ እንዲታዩ ይሰኩ። ያሉዎት ማስታወሻዎች ደህንነታቸው የተጠበቀ ነው።",
    noFavorites: "እስካሁን ተወዳጅ ማስታወሻ የለም",
    markFavorite: "ከዳሽቦርዱ ማስታወሻን እንደ ተወዳጅ ይምረጡ፤ እዚህ ይታያል።",
    emptyArchive: "ማህደሩ ባዶ ነው",
    archiveExplanation: "ማስታወሻን ወደ ማህደር ሲያስገቡት እዚህ ይታያል። ወደ ማህደር ማስገባት ማስታወሻውን ለዘላለም አይሰርዘውም።",
    emptyTrash: "መጣያው ባዶ ነው",
    trashExplanation: "ወደ መጣያ የሚያንቀሳቅሷቸው ማስታወሻዎች እዚህ ይታያሉ።",
    untitledNote: "ርዕስ የሌለው ማስታወሻ",
    noText: "ይህ ማስታወሻ እስካሁን ጽሑፍ የለውም።",
    noTextContent: "ይህ ማስታወሻ ጽሑፍ የለውም።",
    updated: "የተዘመነው",
    recently: "በቅርቡ",
    goToDashboard: "ወደ ዳሽቦርድ",
    pinned: "የተሰካ",
    favorite: "ተወዳጅ",
    archived: "ወደ ማህደር የገባ",
    inTrash: "በመጣያ ውስጥ",
    restore: "መልስ",
    restoreActive: "ወደ ንቁ ማስታወሻዎች መልስ",
    permanentlyDelete: "ለዘላለም ሰርዝ",
    lastUpdated: "ለመጨረሻ ጊዜ የተዘመነው፦",
    confirmPermanentDelete: "ይህን ማስታወሻ ለዘላለም መሰረዝ ይፈልጋሉ? ይህ እርምጃ መመለስ አይቻልም።",

    allFileTypes: "ሁሉም የፋይል ዓይነቶች",
    images: "ምስሎች",
    pdfFiles: "PDF ፋይሎች",
    documents: "ሰነዶች",
    audio: "ድምፅ",
    otherFiles: "ሌሎች ፋይሎች",
    newestFirst: "አዲሶቹ በመጀመሪያ",
    oldestFirst: "አሮጌዎቹ በመጀመሪያ",
    grid: "ፍርግርግ",
    list: "ዝርዝር",
    filterAttachments: "የፋይል ዓይነት ይምረጡ",
    sortAttachments: "ፋይሎችን ደርድር",
    showing: "የሚታዩት",
    of: "ከ",
    files: "ፋይሎች",
    noMatchingAttachments: "የሚዛመድ ፋይል አልተገኘም",
    noAttachments: "እስካሁን የተያያዘ ፋይል የለም",
    tryAnotherFilter: "ሌላ የፍለጋ ቃል ወይም የፋይል ዓይነት ይሞክሩ።",
    attachFiles: "ፋይሎችን ከማስታወሻዎችዎ ጋር ያያይዙ፤ ከዚያ እዚህ ይታያሉ።",
    attachedTo: "የተያያዘው ከ፦",
    download: "አውርድ",
    fileUnavailable: "ፋይሉ አይገኝም",
    previewAttachment: "የተያያዘውን ፋይል ቅድመ እይታ",
    chooseLanguage: "ቋንቋ ይምረጡ",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: TranslationKey): string => translations[language][key];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider.");
  }

  return context;
}
