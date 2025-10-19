export const metadata = {
  title: 'Blog Platform',
  description: 'Minimal blog platform (Next.js + TS + SQLite)'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 16 }}>
        <header style={{ marginBottom: 24 }}>
          <h1>Blog Platform</h1>
          <p style={{ color: '#555' }}>Project setup complete. Implement API and DB next.</p>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
