/*
  Seed script (optional)
  Usage (after installing prisma and @prisma/client and configuring package.json seed):
    npx prisma db seed
*/

import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (idempotent for local dev)
  // await prisma.post.deleteMany();

  const now = new Date();

  const draft = await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world',
      content: 'This is a draft post created by the seed script.',
      status: PostStatus.draft
    }
  });

  const published = await prisma.post.upsert({
    where: { slug: 'getting-started' },
    update: {},
    create: {
      title: 'Getting Started',
      slug: 'getting-started',
      content: 'Welcome! This post is published for demo purposes.',
      status: PostStatus.published,
      publishedAt: now
    }
  });

  console.log('Seeded posts:', { draft: draft.id, published: published.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
