"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/interventions", label: "Interventions" },
  { href: "/planning", label: "Planning hebdo" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Comafrique</div>
        <div className="sidebar-subbrand">Planning Interventions</div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                pathname?.startsWith(item.href) ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/referentiels"
              className={`sidebar-link ${
                pathname?.startsWith("/referentiels") ? "active" : ""
              }`}
            >
              Référentiels
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <>
              <div style={{ marginBottom: 8 }}>
                {user.nom}
                <br />
                <span style={{ opacity: 0.7 }}>{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="sidebar-link"
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 12px",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                Se déconnecter
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
