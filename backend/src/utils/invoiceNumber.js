/**
 * invoiceNumber.js — Gap-less sequential invoice number generator.
 *
 * Format: DNY/YYYY-YY/NNNNN  e.g. DNY/2026-27/00001
 *
 * Uses PostgreSQL SELECT ... FOR UPDATE inside prisma.$transaction to guarantee
 * monotonic, gap-less sequence per Indian Financial Year.
 *
 * NOTE: This function uses $queryRaw and $executeRaw — the documented exception
 * to CONSTRAINT-SCHEMA-001. Prisma has no native nextval() equivalent. The row-lock
 * (SELECT FOR UPDATE) is required for gap-less sequence semantics. The caller MUST
 * wrap the entire transaction in isolationLevel:'Serializable'.
 *
 * The coupon service does NOT use this exception — it uses Prisma-native updateMany
 * with optimistic-concurrency predicate (see coupon.service.js).
 *
 * ARCHITECTURE.md §23.9 + RESEARCH Pattern 7.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx - Prisma tx from $transaction
 * @returns {Promise<string>} Invoice number string e.g. "DNY/2026-27/00001"
 */
import pkg from '@prisma/client';
const { Prisma } = pkg;
import { getFinancialYear } from './financialYear.js';

export async function nextInvoiceNumber(tx) {
  const fy = getFinancialYear();

  // Row-lock the sequence row for this FY — prevents concurrent gaps
  const rows = await tx.$queryRaw(
    Prisma.sql`SELECT current_value FROM invoice_sequences WHERE financial_year = ${fy} FOR UPDATE`
  );

  let nextVal;

  if (rows.length === 0) {
    // First invoice of this financial year — insert seed row
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO invoice_sequences (financial_year, current_value) VALUES (${fy}, 1)`
    );
    nextVal = 1;
  } else {
    nextVal = rows[0].current_value + 1;
    await tx.$executeRaw(
      Prisma.sql`UPDATE invoice_sequences SET current_value = ${nextVal} WHERE financial_year = ${fy}`
    );
  }

  return `DNY/${fy}/${String(nextVal).padStart(5, '0')}`;
}
