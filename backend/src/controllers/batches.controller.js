/**
 * batches.controller.js — Public batch listing endpoint.
 * Route: GET /api/v1/batches?program=BADLAAV&hasSeats=true
 *
 * Returns open batches with seat counts and pricing columns so the frontend
 * StepProgram component can populate the batch dropdown + display prices.
 *
 * hasSeats filter is applied in-process (Phase 1 dataset < 50 batches;
 * field-vs-field WHERE would require raw SQL per CONSTRAINT-SCHEMA-001).
 */
import { prisma } from '../lib/prisma.js';
import { MOCK_BATCHES } from '../lib/mockData.js';

const batchListQuerySchema = {
  // Validated by validate middleware with the z schema from validators package
};

export async function listBatches(req, res, next) {
  try {
    const { program, hasSeats } = req.query;

    let batches;
    try {
      batches = await prisma.batch.findMany({
        where: {
          status: 'OPEN',
          ...(program ? { program } : {}),
        },
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          program: true,
          name: true,
          startDate: true,
          endDate: true,
          venue: true,
          totalSeats: true,
          seatsBooked: true,
          priceIndividual: true,
          priceCouple: true,
          priceCorporate: true,
          status: true,
        },
      });
    } catch (dbErr) {
      console.warn('DB query failed for batches list, falling back to mock data', dbErr);
      batches = MOCK_BATCHES.filter((b) => {
        const matchesProgram = !program || b.program === program;
        return b.status === 'OPEN' && matchesProgram;
      });
    }

    // Apply hasSeats filter in-process (avoids field-vs-field raw SQL)
    const filtered =
      hasSeats === 'true'
        ? batches.filter((b) => b.seatsBooked < b.totalSeats)
        : batches;

    return res.status(200).json({ batches: filtered });
  } catch (err) {
    next(err);
  }
}
