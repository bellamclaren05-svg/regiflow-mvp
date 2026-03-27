import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = router.pathname;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge" />
          RegiFlow
        </div>

        <nav className="nav">
          <Link href="/" className={path === "/" ? "active" : ""}>
            📊 Dashboard
          </Link>
          <Link href="/matters/new" className={path === "/matters/new" ? "active" : ""}>
            ➕ New matter
          </Link>
        </nav>

        <div style={{ marginTop: 18, padding: "12px", color: "var(--muted)", fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Workflow</div>
          <div>Upload → Validate → Lodge</div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{path === "/" ? "Dashboard" : "Matter"}</h1>

          <div className="search">
            🔎
            <input placeholder="Search matters…" />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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