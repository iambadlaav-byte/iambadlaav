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

  // 1. Admin user (arjun@dnyanpith.org)
  const admin = await prisma.user.upsert({
    where: { email: 'arjun@dnyanpith.org' },
    update: {},
    create: {
      name: 'Arjun Thoratt',
      email: 'arjun@dnyanpith.org',
      phone: '0000000000', // placeholder — update on first login
      role: 'ADMIN',
      passwordHash,
      emailVerified: true,
    },
  });

  // 2. Sample Badlaav batch (Aug 2026)
  const batch = await prisma.batch.upsert({
    where: { id: 'seed-badlaav-aug-2026' },
    update: {},
    create: {
      id: 'seed-badlaav-aug-2026',
      program: 'BADLAAV',
      name: 'Badlaav · Aug 2026',
      startDate: new Date('2026-08-15T09:00:00.000Z'),
      endDate: new Date('2026-08-17T17:00:00.000Z'),
      venue: 'Dnyanpith Abhyasika, Ambajogai, Maharashtra',
      totalSeats: 20,
      seatsBooked: 0,
      priceIndividual: 15000,
      priceCouple: 27000,
      priceCorporate: 12000,
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
