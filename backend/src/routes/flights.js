const router = require('express').Router();
const prisma = require('../utils/prisma');
const { optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/flights/{id}:
 *   get:
 *     tags: [Flights]
 *     summary: Get flight details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          include: { user: { select: { fullName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({ success: true, data: flight });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/flights/{id}/seats:
 *   get:
 *     tags: [Flights]
 *     summary: Get real-time seat map for a flight
 */
router.get('/:id/seats', async (req, res, next) => {
  try {
    let seats = await prisma.flightSeat.findMany({
      where: { flightId: req.params.id },
      orderBy: { seatNumber: 'asc' }
    });

    // If no seats exist, generate them on the fly
    if (seats.length === 0) {
      const flight = await prisma.flight.findUnique({ where: { id: req.params.id } });
      if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });

      const newSeats = [];
      // Generate 2 rows of First Class (12 seats)
      for (let i = 1; i <= 2; i++) {
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
          newSeats.push({ flightId: flight.id, seatNumber: `${i}${col}`, seatClass: 'FIRST_CLASS', isAvailable: true, price: flight.firstClassCurrentPrice || flight.economyCurrentPrice * 4 });
        });
      }
      // Generate 5 rows of Business (30 seats)
      for (let i = 3; i <= 7; i++) {
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
          newSeats.push({ flightId: flight.id, seatNumber: `${i}${col}`, seatClass: 'BUSINESS', isAvailable: true, price: flight.businessCurrentPrice || flight.economyCurrentPrice * 2.5 });
        });
      }
      // Generate 20 rows of Economy (120 seats)
      for (let i = 8; i <= 27; i++) {
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
          newSeats.push({ flightId: flight.id, seatNumber: `${i}${col}`, seatClass: 'ECONOMY', isAvailable: true, price: flight.economyCurrentPrice });
        });
      }

      await prisma.flightSeat.createMany({ data: newSeats });
      seats = await prisma.flightSeat.findMany({ where: { flightId: flight.id }, orderBy: { seatNumber: 'asc' } });
    }

    // Group by class
    const seatMap = {
      FIRST_CLASS: seats.filter(s => s.seatClass === 'FIRST_CLASS'),
      BUSINESS: seats.filter(s => s.seatClass === 'BUSINESS'),
      ECONOMY: seats.filter(s => s.seatClass === 'ECONOMY')
    };

    res.json({ success: true, data: seatMap });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/flights/{id}/price-trend:
 *   get:
 *     tags: [Flights]
 *     summary: Get 7-day price trend
 */
router.get('/:id/price-trend', async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const history = await prisma.priceHistory.findMany({
      where: {
        entityType: 'FLIGHT',
        entityId: req.params.id,
        recordedAt: { gte: sevenDaysAgo }
      },
      orderBy: { recordedAt: 'asc' }
    });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
