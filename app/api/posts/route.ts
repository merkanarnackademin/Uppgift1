import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, PostStatus } from '@prisma/client';
import { jsonError } from '@/lib/errors';
import { formatZodError, parseCreatePost, parseListQuery } from '@/lib/validation';
import { ensureUniqueSlug, slugify } from '@/lib/slug';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = parseCreatePost(body);

    // Derive slug if not provided
    let slug = input.slug ? input.slug : slugify(input.title);
    slug = await ensureUniqueSlug(slug);

    const now = new Date();
    const status: PostStatus = (input.status as PostStatus) || 'draft';

    const post = await prisma.post.create({
      data: {
        title: input.title,
        content: input.content ?? '',
        slug,
        status,
        publishedAt: status === 'published' ? now : null
      }
    });

    return NextResponse.json({ post }, { status: 201 });
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
    console.error('POST /api/posts error', err);
    return NextResponse.json(jsonError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }), { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const query = parseListQuery(params);

    const page = query.page;
    const pageSize = query.pageSize;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.PostWhereInput = {};
    if (query.status !== 'all') {
      where.status = query.status as PostStatus;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { content: { contains: query.q, mode: 'insensitive' } }
      ];
    }

    const orderBy: Prisma.PostOrderByWithRelationInput = { [query.sortBy]: query.sortDir } as any;

    const [items, totalItems] = await Promise.all([
      prisma.post.findMany({ where, orderBy, skip, take }),
      query.includeTotal ? prisma.post.count({ where }) : Promise.resolve(0)
    ]);

    const payload: any = { items };
    if (query.includeTotal) {
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      payload.meta = { page, pageSize, totalItems, totalPages };
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        jsonError({ code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: formatZodError(err) }),
        { status: 400 }
      );
    }
    console.error('GET /api/posts error', err);
    return NextResponse.json(jsonError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }), { status: 500 });
  }
}
