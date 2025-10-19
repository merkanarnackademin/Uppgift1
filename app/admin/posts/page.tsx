import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function publishAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  if (post.status !== 'published') {
    await prisma.post.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } });
  }
  revalidatePath('/admin/posts');
  revalidatePath('/');
}

async function unpublishAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  if (post.status !== 'draft') {
    await prisma.post.update({ where: { id }, data: { status: 'draft', publishedAt: null } });
  }
  revalidatePath('/admin/posts');
  revalidatePath('/');
}

async function deleteAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.post.delete({ where: { id } }).catch(() => {});
  revalidatePath('/admin/posts');
  revalidatePath('/');
}

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ marginRight: 'auto' }}>Manage Posts</h2>
        <Link href="/admin/posts/new">New Post</Link>
      </div>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Title</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Updated</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
                    <small style={{ color: '#666' }}>({p.slug})</small>
                  </div>
                </td>
                <td style={{ padding: 8 }}>{p.status}</td>
                <td style={{ padding: 8 }}>{new Date(p.updatedAt).toLocaleString()}</td>
                <td style={{ padding: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {p.status === 'published' ? (
                      <form action={unpublishAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit">Unpublish</button>
                      </form>
                    ) : (
                      <form action={publishAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit">Publish</button>
                      </form>
                    )}
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" style={{ color: 'crimson' }}>Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
