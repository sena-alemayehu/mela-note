
"use client";

import { useLanguage } from "./LanguageProvider";
import "../../styles/language-switcher.css";

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({
  className = "",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`language-switcher ${className}`}
      role="group"
      aria-label="Choose language / ቋንቋ ይምረጡ"
    >
      <button
        type="button"
        className={language === "en" ? "selected" : ""}
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>

      <button
        type="button"
        className={language === "am" ? "selected" : ""}
        aria-pressed={language === "am"}
        onClick={() => setLanguage("am")}
      >
        አማ
      </button>
    </div>
  );
}
