const router = require('express').Router();
const prisma = require('../utils/prisma');
const { optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     tags: [Buses]
 *     summary: Get bus details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/seats', async (req, res, next) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    const seats = [];
    // Generate 40 seats for the bus dynamically in memory
    for (let i = 1; i <= 40; i++) {
      seats.push({
        id: `seat_${bus.id}_${i}`,
        busId: bus.id,
        seatNumber: `${i}`,
        row: Math.ceil(i/4),
        column: (i-1)%4 + 1,
        type: bus.type.includes('SLEEPER') ? 'SLEEPER' : 'SEATER',
        status: i % 7 === 0 ? 'BOOKED' : 'AVAILABLE', // mock some booked seats
        price: bus.currentPrice
      });
    }

    res.json({ success: true, data: seats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
