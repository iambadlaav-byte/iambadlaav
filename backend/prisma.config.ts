/**
 * Prisma configuration (Prisma v7+).
 * Prisma v7 moved connection URLs from schema.prisma datasource to this file.
 * See: https://pris.ly/d/config-datasource
 *
 * PgBouncer + Supabase note (RESEARCH Pattern 5 / Pitfall 1):
 * - DATABASE_URL: Transaction pooler (port 6543, ?pgbouncer=true&connection_limit=1)
 *   Used by the running Express app for all runtime queries.
 * - DIRECT_URL:   Session pooler (port 5432, NO PgBouncer)
 *   Used by `prisma migrate dev`, `prisma migrate deploy`, `prisma db push`,
 *   and the seed script. Prisma routes these commands through directUrl
 *   automatically when set below.
 */
// Prisma 7 no longer auto-loads .env when a prisma.config.ts is present, so we
// load it explicitly here — otherwise env('DATABASE_URL') resolves to nothing
// and every prisma command (generate/migrate/seed) aborts with PrismaConfigEnvError.
import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Pooled URL for runtime queries (port 6543, pgbouncer=true).
    url: env('DATABASE_URL'),
    // Direct URL for schema operations (migrate / db push / seed).
    // Falls back to DATABASE_URL if not set so local dev still works.
    directUrl: env('DIRECT_URL'),
  },
});
