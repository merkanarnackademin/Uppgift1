// Prisma Client singleton for Next.js (App Router)
// Ensures a single PrismaClient instance across hot reloads in dev.

import { PrismaClient } from '@prisma/client';

// Add prisma to the NodeJS global type
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
