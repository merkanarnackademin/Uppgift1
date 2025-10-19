import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError } from '@/lib/errors';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.post.findFirst({ where: { slug: params.slug, status: 'published' } });
    if (!post) {
      return NextResponse.json(
        jsonError({ code: 'NOT_FOUND', message: 'Post not found' }),
        { status: 404 }
      );
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error('GET /api/posts/slug/[slug] error', err);
    return NextResponse.json(
      jsonError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }),
      { status: 500 }
    );
  }
}
