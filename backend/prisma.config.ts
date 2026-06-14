/**
 * Prisma configuration (Prisma v7+).
 * Prisma v7 moved connection URLs from schema.prisma datasource to this file.
 * See: https://pris.ly/d/config-datasource
 *
 * IMPORTANT — Prisma 7 removed `directUrl` support.
 * The `url` below is used for ALL operations (runtime, generate, migrate).
 *
 * For runtime (Express app):
 *   DATABASE_URL = Supabase transaction pooler (port 6543, ?pgbouncer=true)
 *   This is what the running server uses for queries.
 *
 * For migrations (prisma migrate deploy / dev / db push):
 *   PgBouncer does NOT support advisory locks, so migrations MUST use the
 *   direct connection (port 5432). Override DATABASE_URL at the CLI:
 *
 *     DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
 *
 *   Railway does this in preDeployCommand (see railway.json).
 *   Locally, use: $env:DATABASE_URL="<direct-url>"; npx prisma migrate deploy
 */
// Prisma 7 no longer auto-loads .env when a prisma.config.ts is present, so we
// load it explicitly here — otherwise env('DATABASE_URL') resolves to nothing
// and every prisma command (generate/migrate/seed) aborts with PrismaConfigEnvError.
import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Pooled URL for runtime queries (port 6543, pgbouncer=true).
    // For migrations, override DATABASE_URL with DIRECT_URL at the CLI level.
    url: env('DATABASE_URL'),
  },
});
