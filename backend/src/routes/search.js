const router = require('express').Router();
const SearchService = require('../services/SearchService');
const { optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/search/flights:
 *   get:
 *     tags: [Search]
 *     summary: Search flights
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string }
 *         description: Origin IATA code
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: adults
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: class
 *         schema: { type: string, enum: [ECONOMY, BUSINESS, FIRST_CLASS] }
 */
router.get('/flights', optionalAuth, async (req, res, next) => {
  try {
    const result = await SearchService.searchFlights({
      ...req.query,
      seatClass: req.query.class || 'ECONOMY'
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/search/flights/calendar:
 *   get:
 *     tags: [Search]
 *     summary: Get cheapest flight prices for 30 days
 */
router.get('/flights/calendar', async (req, res, next) => {
  try {
    const result = await SearchService.searchFlightCalendar(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/search/hotels:
 *   get:
 *     tags: [Search]
 *     summary: Search hotels
 */
router.get('/hotels', optionalAuth, async (req, res, next) => {
  try {
    const result = await SearchService.searchHotels(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/search/trains:
 *   get:
 *     tags: [Search]
 *     summary: Search trains
 */
router.get('/trains', optionalAuth, async (req, res, next) => {
  try {
    const result = await SearchService.searchTrains(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/search/buses:
 *   get:
 *     tags: [Search]
 *     summary: Search buses
 */
router.get('/buses', optionalAuth, async (req, res, next) => {
  try {
    const result = await SearchService.searchBuses(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/search/autocomplete:
 *   get:
 *     tags: [Search]
 *     summary: Autocomplete city/airport search
 */
router.get('/autocomplete', async (req, res, next) => {
  try {
    const result = await SearchService.autocomplete(req.query.q, req.query.type);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
