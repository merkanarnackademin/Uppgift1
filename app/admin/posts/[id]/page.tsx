import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UpdatePostSchema, PostStatusEnum } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

async function updateAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const raw = {
    title: String(formData.get('title') || ''),
    content: String(formData.get('content') || ''),
    slug: String(formData.get('slug') || ''),
    status: String(formData.get('status') || '')
  };

  try {
    const data: any = {};
    if (raw.title) data.title = raw.title;
    if (raw.content || raw.content === '') data.content = raw.content || null;
    if (raw.slug) data.slug = raw.slug;
    if (raw.status) data.status = PostStatusEnum.parse(raw.status);

    UpdatePostSchema.parse(data);

    // handle publishedAt transitions
    if (data.status === 'published') {
      data.publishedAt = new Date();
    } else if (data.status === 'draft') {
      data.publishedAt = null;
    }

    await prisma.post.update({ where: { id }, data });

    revalidatePath('/');
    revalidatePath('/admin/posts');
    redirect(`/admin/posts/${id}`);
  } catch (e: any) {
    const message = e?.message || 'Failed to update post';
    redirect(`/admin/posts/${id}?error=${encodeURIComponent(message)}`);
  }
}

async function deleteAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.post.delete({ where: { id } }).catch(() => {});
  revalidatePath('/');
  revalidatePath('/admin/posts');
  redirect('/admin/posts');
}

export default async function EditPostPage({ params, searchParams }: { params: { id: string }; searchParams?: { error?: string } }) {
  const id = params.id;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return notFound();
  const error = searchParams?.error;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ marginRight: 'auto' }}>Edit Post</h2>
        <Link href="/admin/posts">Back</Link>
      </div>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      <form action={updateAction} style={{ display: 'grid', gap: 12, maxWidth: 800 }}>
        <input type="hidden" name="id" value={post.id} />
        <label>
          <div>Title</div>
          <input name="title" type="text" defaultValue={post.title} minLength={1} maxLength={200} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div>Slug</div>
          <input name="slug" type="text" defaultValue={post.slug} maxLength={200} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div>Status</div>
          <select name="status" defaultValue={post.status} style={{ width: '100%', padding: 8 }}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <label>
          <div>Content</div>
          <textarea name="content" rows={12} defaultValue={post.content || ''} maxLength={50000} style={{ width: '100%', padding: 8, fontFamily: 'inherit' }} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Save</button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" style={{ color: 'crimson' }}>Delete</button>
          </form>
        </div>
      </form>
    </section>
  );
}
