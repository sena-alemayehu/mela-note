"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  NotebookText,
  Pin,
  Heart,
  Paperclip,
  Archive,
  Trash2,
} from "lucide-react";

type SidebarProps = {
  onNewNote: () => void;
  isOpen?: boolean;
  onNavigate?: () => void;
};

const navigation = [
  { label: "Dashboard", href: "/", icon: House },
  { label: "All Notes", href: "/notes", icon: NotebookText },
  { label: "Pinned Notes", href: "/pinned", icon: Pin },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Attachments", href: "/attachments", icon: Paperclip },
  { label: "Archive", href: "/archive", icon: Archive },
  { label: "Trash", href: "/trash", icon: Trash2 },
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
      {/* Logo and brand name */}
      <Link
        href="/"
        className="dashboard-brand"
        onClick={onNavigate}
      >
        <Image
          src="/images/mela-note-logo.png"
          alt="Mela Note logo"
          width={48}
          height={48}
          priority
          style={{
            width: "48px",
            height: "48px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        <span className="dashboard-brand-name">Mela Note</span>
      </Link>

      {/* Navigation */}
      <nav className="dashboard-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`dashboard-nav-link ${
                active ? "active" : ""
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="dashboard-nav-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="dashboard-sidebar-spacer" />

      {/* New note button */}
      <button
        type="button"
        className="dashboard-profile"
        aria-label="Create a new note"
        onClick={() => {
          onNewNote();
          onNavigate?.();
        }}
      >
        N
      </button>
    </aside>
  );
}