# Blog Platform TODO Checklist

Generated: 2025-10-19 23:23 (local)

Use this as a living checklist to track implementation. It’s derived from spec.md and prompt_plan.md.

Legend: [ ] not started, [*] in progress, [x] done

## 1) Project Setup
- [x] Initialize npm project with TypeScript and Next.js (App Router)
- [x] Configure tsconfig.json and next.config.js
- [x] Add .gitignore (node_modules, .next, prisma/*.db, .env, coverage, .vercel)
- [x] Create base folder structure: app/, app/api/, lib/, prisma/, tests/
- [x] Add README with quick start instructions

## 2) Environment & Configuration
- [ ] Create .env with DATABASE_URL="file:./prisma/dev.db"
- [ ] Add .env.example with placeholders
- [ ] Ensure NODE_ENV handling (development|test|production)

## 3) Database Schema (Prisma + SQLite)
- [ ] Add prisma/schema.prisma with Post model and PostStatus enum per spec
- [ ] Run: npx prisma migrate dev --name init (creates prisma/dev.db)
- [ ] Verify unique index on slug
- [ ] Create optional prisma/seed.ts to add draft and published posts
- [ ] Document DB paths and migration commands in README

## 4) Prisma Client Integration
- [ ] Install prisma and @prisma/client
- [ ] Add lib/prisma.ts with PrismaClient singleton reuse
- [ ] Run: npx prisma generate and ensure types are available

## 5) Validation & Utilities
- [ ] Install zod
- [ ] Add lib/validation.ts (zod schemas):
  - [ ] CreatePost schema: title, optional content, optional slug, optional status (default draft)
  - [ ] UpdatePost schema: partial of title, content, slug, status
  - [ ] Pagination/query schema: page, pageSize, q, status filter, sortBy, sortDir, includeTotal
  - [ ] Error formatting helpers for zod issues
- [ ] Add lib/slug.ts:
  - [ ] slugify(title) per rules: lowercase, trim, replace non [a-z0-9]+ with '-', collapse dashes, trim dashes
  - [ ] ensureUniqueSlug(baseSlug) that appends -2, -3, ... in a transaction
- [ ] Shared error response helper: jsonError({ code, message, details? })

## 6) API Endpoints (Next.js App Router)
Base path: /api/posts
- [ ] POST /api/posts (create)
  - [ ] Validate payload
  - [ ] Generate slug if missing and ensure uniqueness
  - [ ] If status=published set publishedAt=now
  - [ ] Return 201 { post } or 400/409
- [ ] GET /api/posts (list)
  - [ ] Support page, pageSize (max 100), q, status, sortBy, sortDir, includeTotal
  - [ ] Return items and meta when includeTotal=true
- [ ] GET /api/posts/{id} (read one by id)
  - [ ] Return 200 { post } or 404
- [ ] PATCH /api/posts/{id} (update)
  - [ ] Allow title, slug, content, status
  - [ ] Maintain slug uniqueness (409 conflict)
  - [ ] Publishing transitions set/clear publishedAt
- [ ] DELETE /api/posts/{id}
  - [ ] Return 204 No Content
- [ ] (Optional) GET /api/posts/slug/{slug}
  - [ ] Public route returns only published post or 404

## 7) UI (Optional v1)
- [ ] Public pages: / (list published with pagination), /posts/[slug]
- [ ] Admin pages (no auth): /admin/posts, /admin/posts/new, /admin/posts/[id]
- [ ] Basic forms for create/edit, toggle publish, delete

## 8) Testing Setup
- [ ] Choose test runner (Vitest or Jest)
- [ ] Configure ts-node/ts-jest or tsconfig for tests
- [ ] Add npm scripts: test, test:watch, test:unit, test:integration
- [ ] Create test SQLite db path (e.g., prisma/test.db) and test .env
- [ ] Test lifecycle: prisma migrate reset for test db

## 9) Unit Tests
- [ ] lib/slug.ts
  - [ ] slugify handles accents, symbols, spaces, multiple dashes, trimming
  - [ ] uniqueness helper appends -2, -3 with mocked Prisma
- [ ] lib/validation.ts
  - [ ] Title length limits (1–200)
  - [ ] Slug pattern and length (1–200)
  - [ ] Content length (<= 50,000)
  - [ ] Status enum validation

## 10) Integration Tests (API)
- [ ] Setup test DB and reset between tests
- [ ] Create: success, validation error (400), duplicate slug (409), publish sets publishedAt
- [ ] List: pagination, sorting, search q, status filters, includeTotal meta present
- [ ] Read: by id (200/404), by slug (published-only on public route)
- [ ] Update: edit fields, slug conflict (409), publish/unpublish adjust publishedAt, idempotency
- [ ] Delete: returns 204, subsequent read 404

## 11) Developer Experience
- [ ] Add scripts: dev (next dev), build, start, prisma:* (generate, migrate, studio)
- [ ] ESLint + Prettier config and scripts
- [ ] Basic README: setup, scripts, API overview

## 12) Deployment
- [ ] Build and run in production mode locally
- [ ] Ensure DATABASE_URL is configurable for production (file or hosted)
- [ ] Document environment variables and migration steps for deploy

## 13) Performance & Security (v1 scope)
- [ ] Default pagination to avoid large payloads
- [ ] Ensure CORS defaults (same-origin) and no sensitive data leakage
- [ ] Basic output escaping/sanitization in UI if added

## 14) Acceptance Criteria (Definition of Done)
- [ ] CRUD endpoints implemented and conform to API contracts
- [ ] Publish/unpublish sets/clears publishedAt as specified
- [ ] Slug uniqueness guaranteed and deterministic generation from title
- [ ] Validation and error responses follow the standardized format
- [ ] Pagination/sort/search behave as defined
- [ ] Prisma schema and initial migration created; SQLite works locally
- [ ] Unit and integration tests pass locally
- [ ] Documentation updated (README, spec.md, todo.md)
