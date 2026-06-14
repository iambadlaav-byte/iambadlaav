/**
 * Prisma client singleton (Prisma v7, driver-adapter engine).
 *
 * Prisma 7 uses the "client" query engine, which requires a driver adapter
 * instead of a connection URL string. We use @prisma/adapter-pg over node-postgres.
 * The connection URL comes from DATABASE_URL (loaded by `dotenv/config` in server.js).
 *
 * Supabase / PgBouncer note:
 *   The transaction pooler (port 6543) does NOT support prepared statements
 *   across queries. Prisma's adapter-pg accepts the pgbouncer hint via the
 *   URL (?pgbouncer=true), but we also pass `max: 1` to the pg pool to keep
 *   connection usage predictable on Supabase's free tier.
 *
 * globalThis cache survives nodemon hot-reloads in dev so we don't open a new
 * pool on every restart.
 */
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkg;
const globalForPrisma = globalThis;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Refusing to start without a database.');
}

if (!globalForPrisma.__prisma__) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Supabase free tier: keep pool small. Pooler is doing the real pooling.
    max: 1,
  });
  globalForPrisma.__prisma__ = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.__prisma__;
