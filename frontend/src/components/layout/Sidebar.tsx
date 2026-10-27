"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  onNewNote: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
};

const navigation = [
  { label: "Dashboard", href: "/", icon: "⌂" },
  { label: "Attachments", href: "/attachments", icon: "♧" },
  { label: "Trash", href: "/trash", icon: "♜" },
  { label: "Archive notes", href: "/archive", icon: "▣" },
];

export default function Sidebar({
  onNewNote,
  isOpen = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`dashboard-sidebar ${isOpen ? "mobile-open" : ""}`}
    >
      <Link
        href="/"
        className="dashboard-brand"
        onClick={onNavigate}
      >
        <span className="dashboard-brand-icon">▤</span>
        <span>Mela Notes</span>
      </Link>

      <button
        type="button"
        className="dashboard-new-note"
        onClick={() => {
          onNewNote();
          onNavigate?.();
        }}
      >
        + New note
      </button>

      <nav className="dashboard-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`dashboard-nav-link ${
                active ? "active" : ""
              }`}
            >
              <span className="dashboard-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="dashboard-sidebar-spacer" />

      <div className="dashboard-storage">
        <div className="dashboard-storage-label">
          <span>Storage</span>
          <span>2.4 GB of 6 GB</span>
        </div>

        <div
          className="dashboard-storage-track"
          role="progressbar"
          aria-label="Storage used"
          aria-valuemin={0}
          aria-valuemax={6}
          aria-valuenow={2.4}
        >
          <div className="dashboard-storage-fill" />
        </div>
      </div>
    </aside>
  );
}