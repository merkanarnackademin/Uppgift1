import { prisma } from './prisma';

/**
 * Convert an arbitrary string to a URL-safe slug.
 * Rules per spec:
 * - lowercase
 * - trim
 * - replace non [a-z0-9]+ with '-'
 * - collapse multiple dashes
 * - trim leading/trailing dashes
 * - if empty after cleanup, fallback to 'post'
 */
export function slugify(input: string): string {
  const lower = (input || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const replaced = lower.replace(/[^a-z0-9]+/g, '-');
  const collapsed = replaced.replace(/-+/g, '-');
  const trimmed = collapsed.replace(/^-+|-+$/g, '');
  return trimmed || 'post';
}

/**
 * Ensure slug uniqueness by checking existing slugs that start with the baseSlug.
 * If baseSlug is free, return it. Otherwise append -2, -3, ... until a free one is found.
 *
 * Note: True race-free uniqueness is ultimately enforced by the DB unique index.
 * API layer should still handle 409 conflicts on rare concurrent creations.
 */
export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const base = baseSlug;
  const existing = await prisma.post.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true }
  });

  const taken = new Set(existing.map((e) => e.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (true) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
    n += 1;
  }
}
