const router = require('express').Router();
const prisma = require('../utils/prisma');
const { optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/trains/{id}:
 *   get:
 *     tags: [Trains]
 *     summary: Get train details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const train = await prisma.train.findUnique({ where: { id: req.params.id } });
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.json({ success: true, data: train });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/seats', async (req, res, next) => {
  try {
    let seats = await prisma.trainSeat.findMany({
      where: { trainId: req.params.id },
      orderBy: { seatNumber: 'asc' }
    });

    if (seats.length === 0) {
      const train = await prisma.train.findUnique({ where: { id: req.params.id } });
      if (!train) return res.status(404).json({ success: false, message: 'Train not found' });

      const newSeats = [];
      const classes = ['SL', '3A', '2A', '1A', 'CC', 'EC'];
      
      classes.forEach(cls => {
        const priceField = { 'SL': 'sleeperCurrentPrice', '3A': 'ac3CurrentPrice', '2A': 'ac2CurrentPrice', '1A': 'ac1CurrentPrice', 'CC': 'ccCurrentPrice', 'EC': 'ecCurrentPrice' }[cls];
        const price = train[priceField] || 500;
        
        // Generate 40 seats for each class
        for (let i = 1; i <= 40; i++) {
          newSeats.push({
            trainId: train.id,
            seatNumber: `${cls}-${i}`,
            coachNumber: `${cls}${Math.ceil(i/10)}`,
            seatClass: cls,
            status: 'AVAILABLE',
            price
          });
        }
      });

      await prisma.trainSeat.createMany({ data: newSeats });
      seats = await prisma.trainSeat.findMany({ where: { trainId: train.id }, orderBy: { seatNumber: 'asc' } });
    }

    const seatMap = {};
    ['SL', '3A', '2A', '1A', 'CC', 'EC'].forEach(cls => {
      seatMap[cls] = seats.filter(s => s.seatClass === cls);
    });

    res.json({ success: true, data: seatMap });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
