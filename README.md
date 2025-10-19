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

## Next Steps

See `todo.md` for the full checklist.
- Define Prisma schema and run initial migration
- Implement API routes under `/api/posts`
- Add validation and slug utilities
- Add tests and developer tooling

## Requirements
- Node.js 18+
- npm 9+ recommended
