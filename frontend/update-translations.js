const fs = require("fs");

const translations = {
  en: {
    eyebrow: "NOTE EDITOR",
    edit: "Edit Note",
    create: "Create Note",
    saving: "Saving...",
    allSaved: "All changes saved",
    unsavedChanges: "Unsaved changes",
    unpin: "Unpin note",
    pin: "Pin note",
    close: "Close editor",
    textNote: "Text Note",
    checklistNote: "Checklist",
    title: "Title",
    titlePlaceholder: "Enter note title...",
    content: "Content",
    contentPlaceholder: "Start writing your thoughts...",
    color: "Note Color",
    labels: "Labels",
    addLabelPlaceholder: "Enter a label...",
    addLabel: "Add Label",
    attachments: "Attachments",
    noFiles: "No files attached yet.",
    removeFile: "Remove file",
    characters: "characters",
    cancel: "Cancel",
    save: "Save Note",
    completed: "completed",
    checklistAdd: "Add a checklist item...",
    addItemButton: "Add Item"
  },

  am: {
    eyebrow: "የማስታወሻ አርታዒ",
    edit: "ማስታወሻን አርትዕ",
    create: "ማስታወሻ ፍጠር",
    saving: "በማስቀመጥ ላይ...",
    allSaved: "ሁሉም ለውጦች ተቀምጠዋል",
    unsavedChanges: "ያልተቀመጡ ለውጦች",
    unpin: "ከተሰኩ ማስታወሻዎች አስወግድ",
    pin: "ማስታወሻን ሰክት",
    close: "አርታዒውን ዝጋ",
    textNote: "የጽሑፍ ማስታወሻ",
    checklistNote: "የቼክ ዝርዝር",
    title: "ርዕስ",
    titlePlaceholder: "የማስታወሻውን ርዕስ ያስገቡ...",
    content: "ይዘት",
    contentPlaceholder: "ሃሳቦችዎን መጻፍ ይጀምሩ...",
    color: "የማስታወሻ ቀለም",
    labels: "መለያዎች",
    addLabelPlaceholder: "መለያ ያስገቡ...",
    addLabel: "መለያ ጨምር",
    attachments: "አባሪዎች",
    noFiles: "እስካሁን ምንም ፋይል አልተያያዘም።",
    removeFile: "ፋይል አስወግድ",
    characters: "ቁምፊዎች",
    cancel: "ሰርዝ",
    save: "ማስታወሻን አስቀምጥ",
    completed: "ተጠናቋል",
    checklistAdd: "የቼክ ዝርዝር ንጥል ያስገቡ...",
    addItemButton: "ንጥል ጨምር"
  }
};

for (const language of ["en", "am"]) {
  const filePath = `src/i18n/${language}.json`;

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  data.editor = {
    ...(data.editor || {}),
    ...translations[language]
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  console.log(`Updated ${filePath}`);
}
