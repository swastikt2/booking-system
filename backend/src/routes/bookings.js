const router = require('express').Router();
const BookingService = require('../services/BookingService');
const { authenticate } = require('../middleware/auth');
const { z } = require('zod');

/**
 * @swagger
 * /api/bookings/hold:
 *   post:
 *     tags: [Bookings]
 *     summary: Hold a booking for 15 minutes
 *     security: [{ bearerAuth: [] }]
 */
router.post('/hold', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      bookingType: z.string(),
      entityId: z.string(),
      seatDetails: z.any().optional(),
      roomDetails: z.any().optional()
    });
    const data = schema.parse(req.body);
    const result = await BookingService.holdBooking({ userId: req.user.id, ...data });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/bookings/create:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     security: [{ bearerAuth: [] }]
 */
router.post('/create', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      bookingType: z.string(),
      entityId: z.string(),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      roomTypeId: z.string().optional(),
      roomCount: z.number().optional(),
      seatNumbers: z.array(z.string()).optional(),
      seatClass: z.string().optional(),
      passengerDetails: z.array(z.any()).optional(),
      specialRequests: z.string().optional(),
      adults: z.number().optional(),
      children: z.number().optional(),
      infants: z.number().optional()
    });
    const data = schema.parse(req.body);
    const result = await BookingService.createBooking({ userId: req.user.id, ...data });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all user bookings
 *     security: [{ bearerAuth: [] }]
 */
router.get('/my-bookings', authenticate, async (req, res, next) => {
  try {
    const result = await BookingService.getUserBookings(req.user.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/bookings/{ref}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by reference
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:ref', authenticate, async (req, res, next) => {
  try {
    const result = await BookingService.getBookingByRef(req.params.ref, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/bookings/{ref}/cancel:
 *   put:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:ref/cancel', authenticate, async (req, res, next) => {
  try {
    const result = await BookingService.cancelBooking(req.params.ref, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
