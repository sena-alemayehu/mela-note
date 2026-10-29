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
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <Image
              src="/images/mela-note-logo.png"
              alt="Mela Note logo"
              width={40}
              height={40}
              priority

              style={{
             
            width: "180px",
            height: "60px",
            maxWidth: "none",
            objectFit: "contain",
 
              }}

            />
            <span>Mela Note</span>
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
                className={`sidebar-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon" aria-hidden="true">
                  <Icon size={19} strokeWidth={1.8} />
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
            <LogOut size={18} strokeWidth={1.8} />
            <span>{language === "am" ? "ውጣ" : "Log out"}</span>
          </button>
        </div>
      </aside>

      <div className="dashboard-layout-content">
        <header className="mobile-dashboard-header">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? (
              <X size={23} strokeWidth={1.8} />
            ) : (
              <Menu size={23} strokeWidth={1.8} />
            )}
          </button>

          <Link href="/dashboard" className="mobile-brand">
            <Image
              src="/images/mela-note-logo.png"
              alt=""
              width={30}
              height={30}
            />
            <span>Mela Note</span>
          </Link>
        </header>

        {children}
      </div>
    </main>
  );
}