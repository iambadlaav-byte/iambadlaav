/**
 * Prisma seed — idempotent via upsert.
 * Seeds: admin user, sample batch, sample coupon, InvoiceSequence for current FY.
 * Run with: npm --workspace=backend run prisma:seed
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

// Prisma 7 uses the driver-adapter engine: construct with a pg adapter, not a URL.
// DATABASE_URL is loaded from backend/.env by dotenv/config above.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function getFinancialYear(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-indexed: 0=Jan, 3=Apr
  // Indian FY: April 1 – March 31
  return m >= 3
    ? `${y}-${String(y + 1).slice(-2)}`
    : `${y - 1}-${String(y).slice(-2)}`;
}

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'changeme-on-first-deploy';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // 1. Admin user
  const MAP_LINK = 'https://www.google.com/maps/place/Dnyanpitt+Abhyasika/@18.7177129,76.3777553,21z';
  const admin = await prisma.user.upsert({
    where: { email: 'iambadlaav@gmail.com' },
    update: {},
    create: {
      name: 'Arjun Thoratt',
      email: 'iambadlaav@gmail.com',
      phone: '7409339740',
      role: 'ADMIN',
      passwordHash,
      emailVerified: true,
    },
  });

  // 2. Sample "The Retreat" batch (Aug 2026)
  const batch = await prisma.batch.upsert({
    where: { id: 'seed-badlaav-aug-2026' },
    update: {},
    create: {
      id: 'seed-badlaav-aug-2026',
      program: 'BADLAAV',
      name: 'The Retreat · Aug 2026',
      startDate: new Date('2026-08-15T09:00:00.000Z'),
      endDate: new Date('2026-08-17T17:00:00.000Z'),
      venue: 'Ambajogai, Maharashtra',
      address: 'Ambajogai, Dist. Beed, Maharashtra 431517',
      mapLink: MAP_LINK,
      totalSeats: 20,
      seatsBooked: 0,
      waitlistCapacity: 0,
      priceIndividual: 15000,
      priceCouple: 27000,
      priceCorporate: 12000,
      status: 'OPEN',
    },
  });

  // 2b. Sample "The Badlaav Experience" batch (stored under FUTURE_READINESS)
  await prisma.batch.upsert({
    where: { id: 'seed-experience-sep-2026' },
    update: {},
    create: {
      id: 'seed-experience-sep-2026',
      program: 'FUTURE_READINESS',
      name: 'The Badlaav Experience · Sep 2026',
      startDate: new Date('2026-09-12T09:00:00.000Z'),
      endDate: new Date('2026-09-13T17:00:00.000Z'),
      venue: 'Ambajogai, Maharashtra',
      address: 'Ambajogai, Dist. Beed, Maharashtra 431517',
      mapLink: MAP_LINK,
      totalSeats: 40,
      seatsBooked: 0,
      waitlistCapacity: 0,
      priceIndividual: 3500,
      status: 'OPEN',
    },
  });

  // 3. Welcome coupon
  const coupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME500' },
    update: {},
    create: {
      code: 'WELCOME500',
      discountAmount: 500,
      applicablePrograms: ['BADLAAV', 'FUTURE_READINESS'],
      maxUses: 100,
      currentUses: 0,
      active: true,
      validUntil: new Date('2026-12-31T23:59:59.000Z'),
    },
  });

  // 4. InvoiceSequence for current Indian FY
  const fy = getFinancialYear();
  const invoiceSeq = await prisma.invoiceSequence.upsert({
    where: { financialYear: fy },
    update: {},
    create: {
      financialYear: fy,
      currentValue: 0,
    },
  });

  console.log('Seed complete:');
  console.log('  Admin user:', admin.email);
  console.log('  Sample batch:', batch.name);
  console.log('  Coupon:', coupon.code);
  console.log('  InvoiceSequence FY:', invoiceSeq.financialYear);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
