import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

function formatDate(d?: Date | null) {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export default async function HomePage({ searchParams }: { searchParams?: { page?: string; pageSize?: string } }) {
  const page = Math.max(1, Number(searchParams?.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams?.pageSize || 10)));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize
    }),
    prisma.post.count({ where: { status: 'published' } })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <section>
      <h2>Latest Posts</h2>
      {items.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((p) => (
            <li key={p.id} style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '4px 0' }}>
                <Link href={`/posts/${p.slug}`}>{p.title}</Link>
              </h3>
              <small style={{ color: '#666' }}>{formatDate(p.publishedAt)}</small>
              <p style={{ marginTop: 6, color: '#333' }}>
                {p.content?.slice(0, 160) || ''}
                {p.content && p.content.length > 160 ? '…' : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>
          Page {page} of {totalPages}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {hasPrev && <Link href={`/?page=${page - 1}&pageSize=${pageSize}`}>Previous</Link>}
          {hasNext && <Link href={`/?page=${page + 1}&pageSize=${pageSize}`}>Next</Link>}
        </div>
      </div>
    </section>
  );
}
