import Link from 'next/link';

export const metadata = {
  title: 'Blog Platform',
  description: 'Minimal blog platform (Next.js + TS + SQLite)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 16 }}>
        <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Blog Platform</Link>
          </h1>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/admin/posts">Admin</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
