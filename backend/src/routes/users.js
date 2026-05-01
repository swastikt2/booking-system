const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/saved-searches:
 *   get:
 *     tags: [Users]
 *     summary: Get user's saved searches
 *     security: [{ bearerAuth: [] }]
 */
router.get('/saved-searches', authenticate, async (req, res, next) => {
  try {
    const searches = await prisma.savedSearch.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ success: true, data: searches });
  } catch (err) {
    next(err);
  }
});

router.post('/save-search', authenticate, async (req, res, next) => {
  try {
    const { searchType, query, label } = req.body;
    const search = await prisma.savedSearch.create({
      data: { userId: req.user.id, searchType, query: typeof query === 'string' ? query : JSON.stringify(query), label }
    });
    res.status(201).json({ success: true, data: search });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/wishlist:
 *   get:
 *     tags: [Users]
 *     summary: Get user's wishlist
 *     security: [{ bearerAuth: [] }]
 */
router.get('/wishlist', authenticate, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        hotel: {
          include: {
            roomTypes: { where: { available: true }, orderBy: { currentPrice: 'asc' }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: wishlist });
  } catch (err) {
    next(err);
  }
});

router.post('/wishlist/:hotelId', authenticate, async (req, res, next) => {
  try {
    // Toggle wishlist
    const existing = await prisma.wishlist.findUnique({
      where: { userId_hotelId: { userId: req.user.id, hotelId: req.params.hotelId } }
    });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, added: false, message: 'Removed from wishlist' });
    }
    const item = await prisma.wishlist.create({
      data: { userId: req.user.id, hotelId: req.params.hotelId }
    });
    res.status(201).json({ success: true, added: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.get('/loyalty-points', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { loyaltyPoints: true, tier: true, travelCredits: true }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.get('/travel-credits', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { travelCredits: true }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
