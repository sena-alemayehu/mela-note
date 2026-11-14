"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import enData from "../../i18n/en.json";
import amData from "../../i18n/am.json";

export type Language = "en" | "am";

export type Translations = typeof enData;

const translations: Record<Language, Translations> = {
  en: enData,
  am: amData,
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  dict: Translations;
  t: (path: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("mela-note-language");
    if (saved === "en" || saved === "am") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mela-note-language", lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const dict = translations[language];

  // Helper for dot-notated paths, e.g. t('auth.email')
  const t = (path: string, fallback?: string): string => {
    const parts = path.split(".");
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return fallback ?? path;
      }
    }

    return typeof current === "string" ? current : (fallback ?? path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict, t }}>
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
