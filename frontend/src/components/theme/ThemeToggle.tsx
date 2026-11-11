"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useLanguage } from "../language/LanguageProvider";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "mela-note-theme";
const THEME_EVENT = "mela-note-theme-change";

type ThemeToggleProps = {
  className?: string;
  iconSize?: number;
};

export default function ThemeToggle({
  className = "",
  iconSize = 20,
}: ThemeToggleProps) {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Apply the saved theme when the page opens.
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }

    function syncFromDocument() {
      setTheme(
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "dark"
          : "light"
      );
    }

    syncFromDocument();

    // Keeps every toggle on the page in sync.
    window.addEventListener(THEME_EVENT, syncFromDocument);

    return () => {
      window.removeEventListener(THEME_EVENT, syncFromDocument);
    };
  }, []);

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";

    const next: Theme = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  const isDark = theme === "dark";

  const label =
    language === "am"
      ? isDark
        ? "ብርሃን ሞድ"
        : "ጨለማ ሞድ"
      : isDark
        ? "Switch to light mode"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <Sun size={iconSize} strokeWidth={1.8} />
      ) : (
        <Moon size={iconSize} strokeWidth={1.8} />
      )}
    </button>
  );
}