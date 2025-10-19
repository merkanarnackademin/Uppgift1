Title: Blog Platform Specification (Next.js + TypeScript + SQLite)

1. Overview
- Purpose: Build a minimal blog platform that lets a user create, read, update, delete (CRUD) blog posts and toggle publish/unpublish state.
- Scope: Server-rendered Next.js app with a small API layer and SQLite for persistence. Focus on correctness, testability, and a clean path to extend later (auth, comments, etc.).
- Primary Actor: Single author (no authentication in v1). Readers are anonymous.

2. Goals and Non‑Goals
- Goals
  - CRUD for blog posts.
  - Publish/Unpublish posts with timestamps.
  - RESTful API for posts with JSON.
  - Basic web UI for managing posts (optional for v1 if API-first is desired, but endpoints must exist).
  - Deterministic slugs and validation to ensure data integrity.
  - Pagination and basic search/sort.
  - Comprehensive testing plan (unit, integration, e2e-ready).
- Non‑Goals (v1)
  - Authentication/authorization.
  - Draft autosave and rich text editor (use plain text/Markdown body).
  - Media uploads.
  - Tags/categories (keep model simple; can be added later).

3. Functional Requirements
3.1 Post Entity
- Fields
  - id: string (cuid) – unique identifier
  - title: string (1–200 chars)
  - slug: string (unique, URL-safe, derived from title but editable; 1–200 chars)
  - content: string (0–50,000 chars) – plain text or Markdown
  - status: enum [draft, published]
  - publishedAt: datetime | null (null when draft; set when publishing; cleared when unpublishing)
  - createdAt: datetime (auto)
  - updatedAt: datetime (auto)

3.2 Operations
- Create Post
  - Input: title, content, optional slug, optional status (default draft).
  - Behavior: generate unique slug when not provided; validate uniqueness; if status=published, set publishedAt=now.
  - Output: created post.
- Read Posts (List)
  - Query params: page (default 1), pageSize (default 10, max 100), sortBy (createdAt|updatedAt|publishedAt|title), sortDir (asc|desc), status (draft|published|all), q (search in title/content: simple LIKE), includeTotal (boolean).
  - Output: array of posts for the page; optionally total count and pagination meta.
- Read Single Post
  - Access by id or slug.
  - If accessed by slug via public UI, only published posts are visible by default.
- Update Post
  - Editable fields: title, slug, content, status.
  - Behavior: maintain slug uniqueness; when transitioning:
    - draft -> published: set publishedAt=now
    - published -> draft (unpublish): set publishedAt=null
  - Output: updated post.
- Delete Post
  - Hard delete in v1.
  - Output: 204 No Content.
- Publish/Unpublish Convenience
  - May be separate endpoints or part of Update; both are acceptable as long as behavior above is guaranteed.

3.3 Validation & Errors
- Title required, 1–200 chars.
- Slug required, 1–200 chars, URL-safe (lowercase a–z, 0–9, hyphen), unique.
- Content max 50,000 chars.
- Status must be one of [draft, published].
- Error response format (JSON): { error: { code: string, message: string, details?: any } }
- Common HTTP status codes: 200, 201, 204, 400 (validation), 404 (not found), 409 (conflict, e.g., slug duplicate), 500.

3.4 Search/Sort/Pagination
- Pagination: limit/offset via page & pageSize. Return meta: { page, pageSize, totalPages?, totalItems? } when includeTotal=true.
- Sort: sortBy, sortDir; default sortBy=createdAt, sortDir=desc.
- Search: q parameter applies to title OR content via SQLite LIKE; case-insensitive.

4. Technical Requirements
4.1 Stack
- Runtime: Node.js 18+.
- Framework: Next.js (App Router) with TypeScript.
- ORM: Prisma with SQLite.
- Styling: Unspecified (optional); keep minimal if UI added.

4.2 Project Structure (suggested)
- app/
  - api/
    - posts/route.ts (POST, GET list)
    - posts/[id]/route.ts (GET by id, PATCH, DELETE)
    - posts/slug/[slug]/route.ts (GET by slug; optional, or reuse id endpoint)
  - (optional UI pages: /, /posts/[slug], /admin/posts, /admin/posts/new, /admin/posts/[id])
- lib/
  - prisma.ts (PrismaClient singleton)
  - validation.ts (zod schemas)
  - slug.ts (slugify & de-dupe helpers)
- prisma/
  - schema.prisma
  - migrations/
  - seed.ts (optional)
- tests/
  - unit/
  - integration/
  - e2e/ (Playwright optional)

4.3 Database Model (Prisma)
model Post {
  id          String   @id @default(cuid())
  title       String   @db.Text
  slug        String   @unique @db.Text
  content     String   @db.Text
  status      PostStatus @default(draft)
  publishedAt DateTime? 
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum PostStatus {
  draft
  published
}

4.4 API Design
- Base path: /api/posts

A) Create Post
- POST /api/posts
- Body: { title: string, content?: string, slug?: string, status?: 'draft'|'published' }
- 201 -> { post }
- 400 -> validation error
- 409 -> slug exists

B) List Posts
- GET /api/posts?Page=1&pageSize=10&status=published|draft|all&q=...&sortBy=createdAt|updatedAt|publishedAt|title&sortDir=asc|desc&includeTotal=true|false
- 200 -> { items: Post[], meta?: { page, pageSize, totalItems, totalPages } }

C) Get Post by ID
- GET /api/posts/{id}
- 200 -> { post }
- 404 -> not found

D) Update Post
- PATCH /api/posts/{id}
- Body: { title?, slug?, content?, status? }
- 200 -> { post }
- 400/409/404 as applicable

E) Delete Post
- DELETE /api/posts/{id}
- 204

F) Get Post by Slug (optional)
- GET /api/posts/slug/{slug}
- 200 -> { post }
- 404 -> not found or unpublished (if public fetch)

Notes
- For admin-oriented endpoints (create/update/delete), no auth in v1. For public consumption, prefer slug route that returns only published posts.

4.5 Implementation Details
- Validation: Use zod schemas shared between API and UI forms.
- Slug logic:
  - slugify(title): lowercase, trim, replace non [a-z0-9]+ with '-'; collapse dashes; trim dashes.
  - Ensure uniqueness: if exists, append -2, -3, ... in DB transaction.
- Publish/Unpublish logic: toggle status and maintain publishedAt accordingly.
- Error handling: map zod/Prisma errors to standardized JSON error format.
- Prisma Client reuse: singleton pattern to avoid hot-reload connection warnings.
- SQLite file path: prisma/dev.db (default). Allow override via env.

4.6 Configuration
- Environment variables in .env:
  - DATABASE_URL="file:./prisma/dev.db"
  - NODE_ENV=development|test|production

4.7 Migrations & Seeding
- Commands (for reference):
  - npx prisma migrate dev --name init
  - npx prisma db seed (optional)
- Seed data: create a few draft and published posts for testing.

4.8 Performance & Security
- Performance: paginate by default; avoid returning large content lists if unnecessary.
- Security: sanitize/escape output on UI; rate limiting not in v1; CORS default to same-origin.

5. UI Requirements (Optional v1)
- Public pages
  - Home: list published posts (title, excerpt, publishedAt), pagination.
  - Post page: show single published post by slug.
- Admin pages (no auth in v1)
  - Posts list (all statuses), create, edit (toggle publish), delete.

6. Testing Strategy
6.1 Tooling
- Unit/Integration: Vitest or Jest with ts-node/ts-jest.
- API testing: supertest or Next.js request handler invocation via Web APIs (Request/Response from next/server) using the handler directly.
- E2E (optional): Playwright.

6.2 Unit Tests
- slug.ts
  - slugify cases (accents, symbols, spaces, duplicates).
  - uniqueness helper with mocked Prisma.
- validation.ts
  - zod schemas validate limits and error messages.

6.3 Integration Tests (API)
- Spin up a temporary SQLite file (e.g., prisma/test.db) and run prisma migrate reset in test lifecycle.
- Tests:
  - Create: success, validation failure, duplicate slug (409), publish on create sets publishedAt.
  - List: pagination, sorting, search q, status filters, includeTotal meta.
  - Read: by id (found/404), by slug (published-only for public route).
  - Update: change title/content, change slug (conflict), publish/unpublish transitions adjust publishedAt, idempotency.
  - Delete: success (204), then 404 on subsequent read.

6.4 E2E (Optional)
- Basic flow: create draft, publish, appear on home, unpublish removes from home, delete.

6.5 Test Data & Fixtures
- Factory util to create posts with random titles.
- Seed script for manual testing.

6.6 Acceptance Criteria (Definition of Done)
- CRUD endpoints exist and conform to contracts above.
- Publishing behavior sets/clears publishedAt correctly.
- Slug uniqueness guaranteed; deterministic generation from title.
- Validation and error responses conform to spec.
- Pagination/sort/search work as defined.
- Prisma schema and migration created; SQLite DB works locally.
- Unit and integration tests pass locally.

7. Developer Experience
- Scripts (to be added by implementation):
  - dev: next dev
  - build: next build
  - start: next start
  - prisma: generate, migrate, studio
  - test: unit/integration runner
- Documentation: this spec.md kept updated alongside changes.

Appendix A: Example Error
{
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid payload", "details": [{ "path": ["title"], "message": "Required" }] }
}
