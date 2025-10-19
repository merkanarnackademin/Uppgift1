import { z, ZodError } from 'zod';

// Shared enums and constants
export const PostStatusEnum = z.enum(['draft', 'published']);
export type PostStatus = z.infer<typeof PostStatusEnum>;

export const SortByEnum = z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title']);
export const SortDirEnum = z.enum(['asc', 'desc']);

// Constraints per spec
export const TITLE_MIN = 1;
export const TITLE_MAX = 200;
export const SLUG_MIN = 1;
export const SLUG_MAX = 200;
export const CONTENT_MAX = 50_000;

// Slug regex: only lowercase a-z, 0-9 and hyphen; between 1 and 200 chars
export const SLUG_REGEX = /^[a-z0-9-]{1,200}$/;

// Create Post schema
export const CreatePostSchema = z.object({
  title: z.string().min(TITLE_MIN, 'Title is required').max(TITLE_MAX, `Title must be at most ${TITLE_MAX} characters`),
  content: z.string().max(CONTENT_MAX, `Content must be at most ${CONTENT_MAX} characters`).optional(),
  slug: z.string().min(SLUG_MIN).max(SLUG_MAX).regex(SLUG_REGEX, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  status: PostStatusEnum.default('draft').optional()
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

// Update Post schema: all fields optional, but at least one must be present
export const UpdatePostSchema = z
  .object({
    title: z.string().min(TITLE_MIN).max(TITLE_MAX).optional(),
    content: z.string().max(CONTENT_MAX).optional(),
    slug: z.string().min(SLUG_MIN).max(SLUG_MAX).regex(SLUG_REGEX, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    status: PostStatusEnum.optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
    path: []
  });
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

// List/query schema
export const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100, 'pageSize must be <= 100')
    .default(10),
  q: z.string().trim().min(1).optional(),
  status: z.enum(['all', 'draft', 'published']).default('all'),
  sortBy: SortByEnum.default('createdAt'),
  sortDir: SortDirEnum.default('desc'),
  includeTotal: z.coerce.boolean().default(false)
});
export type ListQueryInput = z.infer<typeof ListQuerySchema>;

// Parsing helpers
export function parseCreatePost(input: unknown): CreatePostInput {
  return CreatePostSchema.parse(input);
}
export function parseUpdatePost(input: unknown): UpdatePostInput {
  return UpdatePostSchema.parse(input);
}
export function parseListQuery(input: unknown): ListQueryInput {
  return ListQuerySchema.parse(input);
}

// Error formatting
export type ZodIssueFormatted = { path: (string | number)[]; message: string; code?: string };
export function formatZodError(err: ZodError): ZodIssueFormatted[] {
  return err.issues.map((i) => ({ path: i.path, message: i.message, code: i.code }));
}
