"use client";

import LanguageSwitcher from "../language/LanguageSwitcher";

type HeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onMenuClick: () => void;
};

export default function Header({
  search,
  onSearchChange,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="dashboard-topbar">
      <button
        type="button"
        className="dashboard-mobile-menu"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        ☰
      </button>

      <label className="dashboard-search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search notes and attachments"
          aria-label="Search notes and attachments"
        />
      </label>

      <div className="dashboard-topbar-actions">
        <div className="dashboard-language">
          <LanguageSwitcher />
        </div>

        <button
          type="button"
          className="dashboard-profile"
          aria-label="User profile"
          title="User profile"
        >
          ♙
        </button>
      </div>
    </header>
  );
}