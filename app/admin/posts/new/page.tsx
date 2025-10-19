import { prisma } from '@/lib/prisma';
import { ensureUniqueSlug, slugify } from '@/lib/slug';
import { CreatePostSchema, PostStatusEnum } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function createAction(formData: FormData) {
  'use server';
  const raw = {
    title: String(formData.get('title') || ''),
    content: String(formData.get('content') || ''),
    slug: String(formData.get('slug') || ''),
    status: String(formData.get('status') || 'draft')
  };

  try {
    const parsed = CreatePostSchema.parse({
      title: raw.title,
      content: raw.content || undefined,
      slug: raw.slug ? raw.slug : undefined,
      status: PostStatusEnum.parse(raw.status)
    });

    // Generate slug if missing
    let slug = parsed.slug ? parsed.slug : slugify(parsed.title);
    slug = await ensureUniqueSlug(slug);

    const now = new Date();
    const post = await prisma.post.create({
      data: {
        title: parsed.title,
        content: parsed.content || null,
        slug,
        status: parsed.status,
        publishedAt: parsed.status === 'published' ? now : null
      }
    });

    revalidatePath('/');
    revalidatePath('/admin/posts');
    redirect(`/admin/posts/${post.id}`);
  } catch (e: any) {
    const message = e?.message || 'Failed to create post';
    // Pass back message via URL search param for simplicity
    redirect(`/admin/posts/new?error=${encodeURIComponent(message)}`);
  }
}

export default function NewPostPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;
  return (
    <section>
      <h2>Create New Post</h2>
      {error && (
        <p style={{ color: 'crimson' }}>Error: {error}</p>
      )}
      <form action={createAction} style={{ display: 'grid', gap: 12, maxWidth: 800 }}>
        <label>
          <div>Title</div>
          <input name="title" type="text" required minLength={1} maxLength={200} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div>Slug (optional)</div>
          <input name="slug" type="text" placeholder="auto-generated from title" maxLength={200} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div>Status</div>
          <select name="status" defaultValue="draft" style={{ width: '100%', padding: 8 }}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <label>
          <div>Content</div>
          <textarea name="content" rows={12} maxLength={50000} style={{ width: '100%', padding: 8, fontFamily: 'inherit' }} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Create</button>
        </div>
      </form>
    </section>
  );
}
