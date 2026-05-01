const router = require('express').Router();
const PaymentService = require('../services/PaymentService');
const { authenticate } = require('../middleware/auth');
const { z } = require('zod');

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a demo payment
 *     security: [{ bearerAuth: [] }]
 */
router.post('/initiate', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      bookingId: z.string(),
      amount: z.number().optional(),
      method: z.string(),
      methodDetail: z.string().optional()
    });
    const data = schema.parse(req.body);
    const result = await PaymentService.initiatePayment({ userId: req.user.id, ...data });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/payments/{txnId}/status:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment status
 */
router.get('/:txnId/status', async (req, res, next) => {
  try {
    const result = await PaymentService.getPaymentStatus(req.params.txnId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/payments/{txnId}/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify and process payment (demo)
 */
router.post('/:txnId/verify', async (req, res, next) => {
  try {
    const result = await PaymentService.verifyPayment(req.params.txnId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/payments/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Process refund for cancelled booking
 *     security: [{ bearerAuth: [] }]
 */
router.post('/refund', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'Booking ID required' });
    const result = await PaymentService.processRefund(bookingId, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
