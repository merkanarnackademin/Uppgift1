// Centralized environment configuration and helpers
// Next.js automatically loads .env files. This module provides typed access and sane defaults.

export type NodeEnv = 'development' | 'test' | 'production';

function normalizeNodeEnv(env: string | undefined): NodeEnv {
  if (env === 'production' || env === 'test') return env;
  return 'development';
}

const NODE_ENV: NodeEnv = normalizeNodeEnv(process.env.NODE_ENV);

// Default to local SQLite file per spec if not provided
const DEFAULT_DB_URL = 'file:./prisma/dev.db';
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DB_URL;

// In production, require DATABASE_URL to be explicitly set
if (NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  // Throwing at module load will fail fast during boot/deploy
  throw new Error(
    'DATABASE_URL must be set in production. Provide a valid connection string via environment variables.'
  );
}

export const isDev = NODE_ENV === 'development';
export const isTest = NODE_ENV === 'test';
export const isProd = NODE_ENV === 'production';

export const config = {
  NODE_ENV,
  DATABASE_URL,
};

export type AppConfig = typeof config;
