const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reports/doctor-stats
// Aggregate reporting for admin/receptionists dashboard
router.get('/doctor-stats', authenticate, async (req, res) => {
  try {
    const start = Date.now();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [doctors, appointmentCounts, todayQueueCounts] = await Promise.all([
      prisma.doctor.findMany({
        select: {
          id: true,
          name: true,
          specialization: true,
          department: true,
          consultationFee: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.appointment.groupBy({
        by: ['doctorId', 'status'],
        _count: {
          _all: true,
        },
      }),
      prisma.queueToken.groupBy({
        by: ['doctorId'],
        where: {
          createdAt: { gte: today },
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const appointmentStatsByDoctor = new Map();
    for (const row of appointmentCounts) {
      const stats = appointmentStatsByDoctor.get(row.doctorId) || {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
      };

      const count = row._count._all;
      stats.totalAppointments += count;

      if (row.status === 'COMPLETED') {
        stats.completedAppointments = count;
      }

      if (row.status === 'CANCELLED') {
        stats.cancelledAppointments = count;
      }

      appointmentStatsByDoctor.set(row.doctorId, stats);
    }

    const queueCountsByDoctor = new Map(
      todayQueueCounts.map((row) => [row.doctorId, row._count._all])
    );

    const reportData = doctors.map((doc) => {
      const stats = appointmentStatsByDoctor.get(doc.id) || {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
      };

      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments: stats.totalAppointments,
        completedAppointments: stats.completedAppointments,
        cancelledAppointments: stats.cancelledAppointments,
        todayQueueSize: queueCountsByDoctor.get(doc.id) || 0,
        revenue: stats.completedAppointments * doc.consultationFee,
      };
    });

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

module.exports = router;
