import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

function NavLink({
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
  const path = router.pathname;

  const isDashboard = path === "/";
  const isMatters = path.startsWith("/matters");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="RegiFlow" />
          <div className="brand-text">
            <div className="brand-name">RegiFlow</div>
            <div className="brand-sub">Post-completion workflow</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink href="/" label="Dashboard" active={isDashboard} />
          <NavLink href="/matters/new" label="New matter" active={path === "/matters/new"} />
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-title">Workspace</div>
          <div className="sidebar-footer-sub">Rules • Tasks • Documents</div>
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
              <span className="search-icon">🔎</span>
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
    </div>
  );
}