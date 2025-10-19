import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, PostStatus } from '@prisma/client';
import { jsonError } from '@/lib/errors';
import { formatZodError, parseUpdatePost } from '@/lib/validation';
import { ensureUniqueSlug, slugify } from '@/lib/slug';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json(jsonError({ code: 'NOT_FOUND', message: 'Post not found' }), { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error('GET /api/posts/[id] error', err);
    return NextResponse.json(jsonError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }), { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const input = parseUpdatePost(body);

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json(jsonError({ code: 'NOT_FOUND', message: 'Post not found' }), { status: 404 });
    }

    const data: any = {};
    if (typeof input.title !== 'undefined') data.title = input.title;
    if (typeof input.content !== 'undefined') data.content = input.content ?? '';

    if (typeof input.slug !== 'undefined') {
      // normalize and ensure uniqueness if slug changed
      const desired = input.slug || slugify(existing.title);
      let newSlug = desired;
      if (desired !== existing.slug) {
        newSlug = await ensureUniqueSlug(desired);
      }
      data.slug = newSlug;
    }

    if (typeof input.status !== 'undefined') {
      const nextStatus = input.status as PostStatus;
      data.status = nextStatus;
      if (existing.status !== 'published' && nextStatus === 'published') {
        data.publishedAt = new Date();
      } else if (existing.status === 'published' && nextStatus === 'draft') {
        data.publishedAt = null;
      }
    }

    const post = await prisma.post.update({ where: { id: params.id }, data });
    return NextResponse.json({ post });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        jsonError({ code: 'VALIDATION_ERROR', message: 'Invalid payload', details: formatZodError(err) }),
        { status: 400 }
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          jsonError({ code: 'CONFLICT', message: 'Slug already exists' }),
          { status: 409 }
        );
      }
    }
    console.error('PATCH /api/posts/[id] error', err);
    return NextResponse.json(jsonError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }), { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.post.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record to delete does not exist.
      if (err.code === 'P2025') {
        return NextResponse.json(jsonError({ code: 'NOT_FOUND', message: 'Post not found' }), { status: 404 });
      }
    }
    console.error('DELETE /api/posts/[id] error', err);
    return NextResponse.json(jsonError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }), { status: 500 });
  }
}
