# Blog Platform (Next.js + TypeScript + SQLite)

This is the starting point for a minimal blog platform per `spec.md`.

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Run the dev server

```bash
npm run dev
```

Then open http://localhost:3000

3) Build and start (production)

```bash
npm run build
npm start
```

## Project Structure

- app/ — Next.js App Router pages
  - app/page.tsx — homepage
  - app/layout.tsx — root layout
  - app/api/ — API routes will be added here
- lib/ — utilities (validation, slug, prisma client) — to be added
- prisma/ — Prisma schema and migrations — to be added
- tests/ — unit & integration tests — to be added

## Environment & Configuration

- Copy .env.example to .env and adjust values as needed
- DATABASE_URL points to your SQLite database (default: file:./prisma/dev.db)
- NODE_ENV is normalized by lib/config.ts and typically set by npm scripts
- In production, you must set DATABASE_URL explicitly; the app will fail fast if it is missing

## Database (Prisma + SQLite)

Paths
- Schema: prisma/schema.prisma
- Dev DB file (default via .env): prisma/dev.db

Common commands (run after installing prisma and @prisma/client in Step 4)
- npx prisma migrate dev --name init
- npx prisma db seed
- npx prisma studio

Notes
- The initial schema defines a Post model with a unique slug and PostStatus enum (draft|published)
- publishedAt is set when a post is published and cleared when unpublished (handled in API logic)

## Next Steps

See `todo.md` for the full checklist.
- Define Prisma schema and run initial migration
- Implement API routes under `/api/posts`
- Add validation and slug utilities
- Add tests and developer tooling

## Requirements
- Node.js 18+
- npm 9+ recommended
