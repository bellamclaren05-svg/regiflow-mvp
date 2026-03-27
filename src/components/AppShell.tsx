import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`nav-item ${active ? "active" : ""}`}>
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = router.pathname;

  const isDashboard = pathname === "/";
  const isMatters = pathname.startsWith("/matters");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge" />
          <div>
            <div style={{ fontWeight: 900, lineHeight: 1.1 }}>RegiFlow</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Post-completion workflow
            </div>
          </div>
        </div>

        <nav className="nav">
          <NavItem href="/" label="Dashboard" active={isDashboard} />
          <NavItem href="/matters/new" label="New matter" active={pathname === "/matters/new"} />
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-title">Workspace</div>
          <div className="sidebar-footer-sub">
            Rules • Tasks • Documents
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-title">
              {isDashboard ? "Dashboard" : isMatters ? "Matters" : "RegiFlow"}
            </div>
          </div>

          <div className="topbar-center">
            <div className="search">
              <span style={{ fontSize: 14, color: "var(--muted)" }}>🔎</span>
              <input placeholder="Search matters…" />
            </div>
          </div>

          <div className="topbar-right">
            <span className="badge badge-info">MVP</span>
          </div>
        </header>

        <main className="content">
          <div className="container">{children}</div>
        </main>
      </div>

      <style jsx>{`
        /* Local styles for shell-only elements (uses your globals variables) */
        .nav-item {
          display: flex;
          align-items: center;
          padding: 9px 10px;
          border-radius: 10px;
          color: var(--muted);
          font-size: 14px;
          border: 1px solid transparent;
        }
        .nav-item:hover {
          background: rgba(2, 6, 23, 0.04);
          color: var(--text);
        }
        .nav-item.active {
          background: var(--primary-soft);
          color: var(--primary);
          border-color: rgba(29, 78, 216, 0.18);
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 12px 10px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.6);
        }
        .sidebar-footer-title {
          font-weight: 800;
          font-size: 12px;
          color: var(--text);
          margin-bottom: 4px;
        }
        .sidebar-footer-sub {
          font-size: 12px;
          color: var(--muted);
        }

        .page-title {
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 0.2px;
        }

        .topbar-left,
        .topbar-right {
          min-width: 160px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .topbar-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 980px) {
          .topbar-left,
          .topbar-right {
            min-width: auto;
          }
          .topbar-center {
            justify-content: stretch;
          }
        }
      `}</style>
    </div>
  );
}