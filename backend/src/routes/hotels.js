const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { z } = require('zod');

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     tags: [Hotels]
 *     summary: Get hotel details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      include: {
        roomTypes: { where: { available: true }, orderBy: { currentPrice: 'asc' } },
        reviews: {
          include: { user: { select: { fullName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    // Parse JSON string fields from SQLite
    const parseJson = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } };

    // Calculate average rating
    const avgRating = hotel.reviews.length > 0
      ? (hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / hotel.reviews.length).toFixed(1)
      : null;

    res.json({
      success: true,
      data: {
        ...hotel,
        amenities: parseJson(hotel.amenities),
        images: parseJson(hotel.images),
        roomTypes: hotel.roomTypes.map(rt => ({ ...rt, amenities: parseJson(rt.amenities), images: parseJson(rt.images) })),
        avgRating: avgRating ? parseFloat(avgRating) : null,
        reviewCount: hotel.reviews.length
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/hotels/{id}/rooms:
 *   get:
 *     tags: [Hotels]
 *     summary: Get available rooms for a hotel
 */
router.get('/:id/rooms', async (req, res, next) => {
  try {
    const rooms = await prisma.roomType.findMany({
      where: { hotelId: req.params.id, available: true },
      orderBy: { currentPrice: 'asc' }
    });
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/hotels/{id}/reviews:
 *   get:
 *     tags: [Hotels]
 *     summary: Get hotel reviews
 */
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { hotelId: req.params.id },
        include: { user: { select: { fullName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.review.count({ where: { hotelId: req.params.id } })
    ]);
    res.json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/hotels/{id}/reviews:
 *   post:
 *     tags: [Hotels]
 *     summary: Add a review
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/reviews', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      body: z.string().min(10),
      pros: z.string().optional(),
      cons: z.string().optional()
    });
    const data = schema.parse(req.body);

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        hotelId: req.params.id,
        ...data,
        verifiedStay: false
      }
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/hotels/{id}/price-trend:
 *   get:
 *     tags: [Hotels]
 *     summary: Get 7-day price trend
 */
router.get('/:id/price-trend', async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const history = await prisma.priceHistory.findMany({
      where: {
        entityType: 'HOTEL',
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
