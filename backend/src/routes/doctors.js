const express = require('express');
const { Prisma, PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/doctors
// Retrieve list of doctors with optional search filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const conditions = [];

    if (search) {
      conditions.push(Prisma.sql`name ILIKE ${`%${String(search)}%`}`);
    }

    if (specialization && specialization !== 'All') {
      conditions.push(Prisma.sql`specialization = ${String(specialization)}`);
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    const doctors = await prisma.$queryRaw`
      SELECT *
      FROM "Doctor"
      ${whereClause}
      ORDER BY name ASC
    `;

    // Inconsistent API formatting (directly sending array)
    res.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/stats
// Returns aggregation details about available doctors
router.get('/stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    const [totalDoctors, surgeonsCount, doctorAggregates] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({
        where: { department: 'Surgery' },
      }),
      prisma.doctor.aggregate({
        _avg: {
          consultationFee: true,
        },
        _max: {
          experience: true,
        },
      }),
    ]);

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      data: {
        total: totalDoctors,
        surgeons: surgeonsCount,
        averageFee: Math.round(doctorAggregates._avg.consultationFee || 0),
        maxExperience: doctorAggregates._max.experience || 0,
      },
      debugInfo: {
        executionTimeMs: durationMs,
        notes: 'Loaded independent database aggregates in parallel.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
