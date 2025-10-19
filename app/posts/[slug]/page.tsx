import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findFirst({ where: { slug: params.slug, status: 'published' } });
  if (!post) return notFound();

  return (
    <article>
      <h2 style={{ marginTop: 0 }}>{post.title}</h2>
      {post.publishedAt && (
        <p style={{ color: '#666', marginTop: 4 }}>
          Published on {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(post.publishedAt)}
        </p>
      )}
      <div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{post.content}</div>
    </article>
  );
}
