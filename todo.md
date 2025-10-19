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
- [x] Create .env with DATABASE_URL="file:./prisma/dev.db"
- [x] Add .env.example with placeholders
- [x] Ensure NODE_ENV handling (development|test|production)

## 3) Database Schema (Prisma + SQLite)
- [x] Add prisma/schema.prisma with Post model and PostStatus enum per spec
- [x] Run: npx prisma migrate dev --name init (creates prisma/dev.db)
- [x] Verify unique index on slug
- [x] Create optional prisma/seed.ts to add draft and published posts
- [x] Document DB paths and migration commands in README

## 4) Prisma Client Integration
- [x] Install prisma and @prisma/client
- [x] Add lib/prisma.ts with PrismaClient singleton reuse
- [x] Run: npx prisma generate and ensure types are available

## 5) Validation & Utilities
- [x] Install zod
- [x] Add lib/validation.ts (zod schemas):
  - [x] CreatePost schema: title, optional content, optional slug, optional status (default draft)
  - [x] UpdatePost schema: partial of title, content, slug, status
  - [x] Pagination/query schema: page, pageSize, q, status filter, sortBy, sortDir, includeTotal
  - [x] Error formatting helpers for zod issues
- [x] Add lib/slug.ts:
  - [x] slugify(title) per rules: lowercase, trim, replace non [a-z0-9]+ with '-', collapse dashes, trim dashes
  - [x] ensureUniqueSlug(baseSlug) that appends -2, -3, ... in a transaction
- [x] Shared error response helper: jsonError({ code, message, details? })

## 6) API Endpoints (Next.js App Router)
Base path: /api/posts
- [x] POST /api/posts (create)
  - [x] Validate payload
  - [x] Generate slug if missing and ensure uniqueness
  - [x] If status=published set publishedAt=now
  - [x] Return 201 { post } or 400/409
- [x] GET /api/posts (list)
  - [x] Support page, pageSize (max 100), q, status, sortBy, sortDir, includeTotal
  - [x] Return items and meta when includeTotal=true
- [x] GET /api/posts/{id} (read one by id)
  - [x] Return 200 { post } or 404
- [x] PATCH /api/posts/{id} (update)
  - [x] Allow title, slug, content, status
  - [x] Maintain slug uniqueness (409 conflict)
  - [x] Publishing transitions set/clear publishedAt
- [x] DELETE /api/posts/{id}
  - [x] Return 204 No Content
- [x] (Optional) GET /api/posts/slug/{slug}
  - [x] Public route returns only published post or 404

## 7) UI 
- [x] Public pages: / (list published with pagination), /posts/[slug]
- [x] Admin pages (no auth): /admin/posts, /admin/posts/new, /admin/posts/[id]
- [x] Basic forms for create/edit, toggle publish, delete

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
