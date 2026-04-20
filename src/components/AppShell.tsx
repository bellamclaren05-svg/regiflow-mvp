// src/components/AppShell.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

// ── Icons (inline SVG, no icon library needed) ─────────────────────────────

const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const IconMatters = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 4V3M11 4V3M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconDocuments = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10 2v3h3M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconTasks = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconRules = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconRequisitions = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L1.5 5v6l6.5 3.5L14.5 11V5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M8 1.5v13M1.5 5l6.5 3.5L14.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1.5a5 5 0 015 5v3l1 1.5H1.5L2.5 9.5v-3a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M6 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const LogoMark = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.85"/>
  </svg>
);

// ── Nav config ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/',         label: 'Dashboard',    icon: <IconDashboard />,    group: 'workspace' },
  { href: '/matters',  label: 'All Matters',  icon: <IconMatters />,      group: 'workspace' },
  { href: '/documents',label: 'Documents',    icon: <IconDocuments />,    group: 'workspace' },
  { href: '/tasks',    label: 'Tasks',        icon: <IconTasks />,        group: 'workspace' },
  { href: '/rules',    label: 'Rules',        icon: <IconRules />,        group: 'automation' },
  { href: '/requisitions', label: 'Requisitions', icon: <IconRequisitions />, group: 'automation' },
];

// ── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // Derive a page title from the current route
  const pageTitle = (() => {
    const p = router.pathname;
    if (p === '/') return 'Dashboard';
    if (p.startsWith('/matters/')) return 'Matter Detail';
    if (p.startsWith('/matters')) return 'All Matters';
    if (p.startsWith('/documents')) return 'Documents';
    if (p.startsWith('/tasks')) return 'Tasks';
    if (p.startsWith('/rules')) return 'Automation Rules';
    if (p.startsWith('/requisitions')) return 'Requisitions';
    return 'RegiFlow';
  })();

  const workspaceItems = NAV_ITEMS.filter(n => n.group === 'workspace');
  const automationItems = NAV_ITEMS.filter(n => n.group === 'automation');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-w)',
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        maxHeight: '100vh',
      }}>

        {/* Logo row */}
        <div style={{
          height: 'var(--topbar-h)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          {/* Logo mark — attempts public/logo.png, falls back to SVG icon */}
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 7,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <Image
              src="/logo.png"
              alt="RegiFlow"
              width={28}
              height={28}
              style={{ objectFit: 'cover', borderRadius: 7 }}
              onError={(e) => {
                // If logo.png missing, show SVG fallback
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
            opacity: collapsed ? 0 : 1,
            transition: 'opacity 0.15s',
            pointerEvents: collapsed ? 'none' : 'auto',
          }}>
            RegiFlow
          </span>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1,
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <NavSection label="Workspace" collapsed={collapsed} />
          {workspaceItems.map(item => (
            <NavItem key={item.href} {...item} collapsed={collapsed} active={
              item.href === '/'
                ? router.pathname === '/'
                : router.pathname.startsWith(item.href)
            } />
          ))}

          <NavSection label="Automation" collapsed={collapsed} style={{ marginTop: 8 }} />
          {automationItems.map(item => (
            <NavItem key={item.href} {...item} collapsed={collapsed} active={
              router.pathname.startsWith(item.href)
            } />
          ))}
        </nav>

        {/* Collapse button */}
        <div style={{ padding: 8, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font)',
              fontSize: 13,
              whiteSpace: 'nowrap',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-page)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            <span style={{
              display: 'flex',
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.22s',
            }}>
              <IconChevronLeft />
            </span>
            <span style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.15s' }}>
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-h)',
          background: 'var(--bg-topbar)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: 'var(--text-primary)' }}>
            {pageTitle}
          </span>

          {/* Search (visual placeholder) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            padding: '6px 12px',
            color: 'var(--text-muted)',
            fontSize: 12.5,
            width: 200,
            cursor: 'text',
            userSelect: 'none',
          }}>
            <IconSearch />
            Search matters...
          </div>

          {/* Bell icon */}
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}>
            <IconBell />
          </div>

          {/* Avatar */}
          <div style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
          }}>
            RF
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function NavSection({ label, collapsed, style = {} }: {
  label: string;
  collapsed: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: '8px 10px 4px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.15s',
      ...style,
    }}>
      {label}
    </div>
  );
}

function NavItem({ href, label, icon, collapsed, active }: {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-soft)' : 'transparent',
        fontWeight: active ? 500 : 400,
        fontSize: 13,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        transition: 'background 0.12s, color 0.12s',
      }}
        onMouseEnter={e => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-page)';
            (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)';
          }
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
        <span style={{
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 0.15s',
          overflow: 'hidden',
        }}>
          {label}
        </span>
      </div>
    </Link>
  );
}