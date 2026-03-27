import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge" />
          RegiFlow
        </div>

        <nav className="nav">
          <Link href="/" className={router.pathname === "/" ? "active" : ""}>
            Dashboard
          </Link>
          <Link
            href="/matters/new"
            className={router.pathname === "/matters/new" ? "active" : ""}
          >
            New matter
          </Link>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{router.pathname.startsWith("/matters") ? "Matters" : "Dashboard"}</h1>
          </div>

          <div className="search">
            <span style={{ fontSize: 14, color: "var(--muted)" }}>🔎</span>
            <input placeholder="Search matters…" />
          </div>

          <div className="topbar-right">
            <span className="badge badge-info">MVP</span>
          </div>
        </header>

        <main className="content">
          <div className="container">{children}</div>
        </main>
      </div>
    </div>
  );
}
``