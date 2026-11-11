"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  NotebookText,
  Pin,
  Heart,
  Paperclip,
  Archive,
  Trash2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useLanguage } from "../../components/language/LanguageProvider";
import LanguageSwitcher from "../../components/language/LanguageSwitcher";
import ThemeToggle from "../../components/theme/ThemeToggle";
import "../../styles/dashboard.css";

const navigation = [
  {
    label: "Dashboard",
    labelAm: "ዳሽቦርድ",
    href: "/dashboard",
    icon: House,
  },
  {
    label: "All Notes",
    labelAm: "ሁሉም ማስታወሻዎች",
    href: "/dashboard/notes",
    icon: NotebookText,
  },
  {
    label: "Pinned Notes",
    labelAm: "የተሰኩ ማስታወሻዎች",
    href: "/dashboard/pinned",
    icon: Pin,
  },
  {
    label: "Favorites",
    labelAm: "ተወዳጆች",
    href: "/dashboard/favorites",
    icon: Heart,
  },
  {
    label: "Attachments",
    labelAm: "የተያያዙ ፋይሎች",
    href: "/dashboard/attachments",
    icon: Paperclip,
  },
  {
    label: "Archive",
    labelAm: "ማህደር",
    href: "/dashboard/archive",
    icon: Archive,
  },
  {
    label: "Trash",
    labelAm: "ቆሻሻ",
    href: "/dashboard/trash",
    icon: Trash2,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  function handleLogout() {
    // Clear backend authentication data.
    localStorage.removeItem("mela-note-access-token");
    localStorage.removeItem("mela-note-user");

    // Clear old demo authentication data.
    sessionStorage.removeItem("mela-note-demo-authenticated");
    sessionStorage.removeItem("mela-note-demo-account");
    sessionStorage.removeItem("mela-note-demo-user");

    // Navigate back to login.
    router.replace("/login");
  }

  return (
    <main
      className={`dashboard-page ${
        sidebarOpen ? "sidebar-open" : ""
      }`}
    >
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
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

            <span
              className="dashboard-brand-name"
              style={{
                fontSize: "28px",
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "#000000" }}>
                Mela
              </span>

              <span
                style={{
                  color: "#FFFFFF",
                  marginLeft: "5px",
                }}
              >
                Note
              </span>
            </span>
          </Link>
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="Main navigation"
        >
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${
                  active ? "active" : ""
                }`}
                aria-current={active ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className="sidebar-link-icon"
                  aria-hidden="true"
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>

                <span>
                  {language === "am"
                    ? item.labelAm
                    : item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <LanguageSwitcher />

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={1.8} />

            <span>
              {language === "am" ? "ውጣ" : "Log out"}
            </span>
          </button>
        </div>
      </aside>

      <div className="dashboard-layout-content">
        {/* Mobile & tablet navbar: brand on the left, theme + menu on the right */}
        <header className="mobile-dashboard-header">
          <Link
            href="/dashboard"
            className="mobile-brand"
            onClick={() => setSidebarOpen(false)}
          >
            <Image
              src="/images/mela-note-logo.png"
              alt="Mela Note logo"
              width={34}
              height={34}
              priority
            />

            <span className="dashboard-brand-name">
              <span>Mela</span>
              <span>Note</span>
            </span>
          </Link>

          <div className="mobile-header-actions">
            <ThemeToggle className="mobile-theme-button" />

            <button
              type="button"
              className="mobile-menu-button"
              aria-label={
                sidebarOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={sidebarOpen}
              onClick={() =>
                setSidebarOpen((open) => !open)
              }
            >
              {sidebarOpen ? (
                <X size={23} strokeWidth={1.8} />
              ) : (
                <Menu size={23} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}