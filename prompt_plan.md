## Step 1: Project Setup
- Initialize npm project
- Install dependencies
- Create folder structure

## Step 2: Database Schema
- Define SQLite schema
- Create migration script
- Add seed data

## Step 3: Prisma Integration
- Install and initialize Prisma
- Configure DATABASE_URL in .env
- Generate Prisma Client and set up singleton

## Step 4: Validation & Utilities
- Implement zod schemas for request validation
- Create slugify and uniqueness helpers
- Add shared error response helpers

## Step 5: API Endpoints (Next.js App Router)
- Create POST /api/posts (create)
- Create GET /api/posts (list with pagination/search/sort)
- Create GET /api/posts/{id} (read one)
- Create PATCH /api/posts/{id} (update/publish/unpublish)
- Create DELETE /api/posts/{id} (delete)
- (Optional) GET /api/posts/slug/{slug} (public by slug)

## Step 6: UI (Optional v1)
- Admin pages for list/create/edit/delete
- Public pages: home list and post detail by slug

## Step 7: Testing
- Unit tests for validation and slug utilities
- Integration tests for API routes with test SQLite DB
- Seed/factory utilities for tests

## Step 8: Developer Experience
- Add npm scripts (dev, build, start, test, prisma)
- Configure ESLint/Prettier
- Add basic README usage notes

## Step 9: Deployment
- Build and run in production mode
- Provision and point DATABASE_URL for production
- Document environment variables