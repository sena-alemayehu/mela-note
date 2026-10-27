
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "../../components/language/LanguageProvider";
import LanguageSwitcher from "../../components/language/LanguageSwitcher";
import "../../styles/dashboard.css";

const navigation = [
  { label: "Dashboard", labelAm: "ዳሽቦርድ", href: "/dashboard", icon: "⌂" },
  { label: "All Notes", labelAm: "ሁሉም ማስታወሻዎች", href: "/dashboard/notes", icon: "▤" },
  { label: "Pinned Notes", labelAm: "የተሰኩ ማስታወሻዎች", href: "/dashboard/pinned", icon: "📌" },
  { label: "Favorites", labelAm: "ተወዳጆች", href: "/dashboard/favorites", icon: "♡" },
  { label: "Attachments", labelAm: "የተያያዙ ፋይሎች", href: "/dashboard/attachments", icon: "📎" },
  { label: "Archive", labelAm: "ማህደር", href: "/dashboard/archive", icon: "▣" },
  { label: "Trash", labelAm: "ቆሻሻ", href: "/dashboard/trash", icon: "♲" },
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
    sessionStorage.removeItem("mela-note-demo-user");
    router.push("/login");
  }

  return (
    <main className={`dashboard-page ${sidebarOpen ? "sidebar-open" : ""}`}>
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
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <span className="sidebar-brand-icon">M</span>
            <span>Mela Note</span>
          </Link>
        </div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  {language === "am" ? item.labelAm : item.label}
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
            ↪ {language === "am" ? "ውጣ" : "Log out"}
          </button>
        </div>
      </aside>

      <div className="dashboard-layout-content">
        <header className="mobile-dashboard-header">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </button>
          <Link href="/dashboard" className="mobile-brand">
            Mela Note
          </Link>
        </header>

        {children}
      </div>
    </main>
  );
}
