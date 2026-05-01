const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     security: [{ bearerAuth: [] }]
 */
router.get('/dashboard/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [
      totalUsers, totalBookings, confirmedBookings, cancelledBookings,
      totalRevenue, totalHotels, totalFlights, totalTrains, totalBuses,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.hotel.count(),
      prisma.flight.count(),
      prisma.train.count(),
      prisma.bus.count(),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { fullName: true, email: true } }
        }
      })
    ]);

    // Bookings by type
    const bookingsByType = await prisma.booking.groupBy({
      by: ['bookingType'],
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await prisma.booking.count({
      where: { createdAt: { gte: today } }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        todayBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        inventory: { hotels: totalHotels, flights: totalFlights, trains: totalTrains, buses: totalBuses },
        bookingsByType,
        recentBookings
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/bookings', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, bookingType, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (bookingType) where.bookingType = bookingType;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          payments: { select: { status: true, transactionId: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/bookings/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

router.get('/price-logs', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { entityType, page = 1, limit = 50 } = req.query;
    const where = {};
    if (entityType) where.entityType = entityType;

    const logs = await prisma.priceHistory.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

router.post('/seed-data', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { seedDatabase } = require('../../prisma/seed');
    await seedDatabase();
    res.json({ success: true, message: 'Database re-seeded successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
