import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <nav>
        <div className="container">
          <Link href="/" className="brand">RegiFlow</Link>
          <ul>
            <li><Link href="/">Matters</Link></li>
            <li><Link href="/matters/new">New Matter</Link></li>
          </ul>
        </div>
      </nav>
      <main className="container">{children}</main>
      <footer style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '.8rem' }}>
        RegiFlow MVP — human-in-the-loop post-completion orchestration
      </footer>
    </>
  );
}
