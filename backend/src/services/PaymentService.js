const prisma = require('../utils/prisma');
const { v4: uuidv4 } = require('uuid');
const BookingService = require('./BookingService');

class PaymentService {
  // Supported payment methods
  static METHODS = {
    CARD: { successRate: 0.95, processingTime: [1500, 3000] },
    UPI: { successRate: 0.92, processingTime: [1000, 2500] },
    NETBANKING: { successRate: 0.88, processingTime: [2000, 3500] },
    WALLET: { successRate: 0.96, processingTime: [800, 1500] },
    EMI: { successRate: 0.90, processingTime: [2000, 4000] }
  };

  // Generate mock transaction ID
  generateTransactionId() {
    const ts = Date.now();
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TXN_DEMO_${ts}_${rand}`;
  }

  // ═══════════════════════════════════════════════
  // INITIATE PAYMENT
  // ═══════════════════════════════════════════════
  async initiatePayment({ bookingId, userId, amount, method, methodDetail }) {
    // Validate booking
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    if (booking.userId !== userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
    if (booking.status === 'CONFIRMED') throw Object.assign(new Error('Booking already paid'), { statusCode: 400 });

    // Check if booking expired
    if (booking.expiresAt && new Date(booking.expiresAt) < new Date()) {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'EXPIRED' } });
      throw Object.assign(new Error('Booking hold has expired'), { statusCode: 410 });
    }

    const transactionId = this.generateTransactionId();
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount: amount || booking.totalAmount,
        currency: booking.currency,
        method: this.normalizeMethod(method),
        methodDetail: methodDetail || this.getMethodDetail(method),
        status: 'PROCESSING',
        transactionId,
        gateway: 'DEMO_RAZORPAY'
      }
    });

    return {
      success: true,
      payment,
      transactionId,
      message: 'Payment initiated. Processing...',
      demo: true
    };
  }

  // ═══════════════════════════════════════════════
  // VERIFY / PROCESS PAYMENT (Demo simulation)
  // ═══════════════════════════════════════════════
  async verifyPayment(transactionId) {
    const payment = await prisma.payment.findUnique({ where: { transactionId } });
    if (!payment) throw Object.assign(new Error('Payment not found'), { statusCode: 404 });

    // Simulate processing delay
    const methodConfig = PaymentService.METHODS[payment.method] || PaymentService.METHODS.CARD;
    const [minDelay, maxDelay] = methodConfig.processingTime;
    await new Promise(r => setTimeout(r, minDelay + Math.random() * (maxDelay - minDelay)));

    // Simulate success/failure based on method success rate
    const isSuccess = Math.random() < methodConfig.successRate;

    if (isSuccess) {
      // Update payment to SUCCESS
      const updatedPayment = await prisma.payment.update({
        where: { transactionId },
        data: { status: 'SUCCESS', paidAt: new Date() }
      });

      // Confirm the booking
      await BookingService.confirmBooking(payment.bookingId);

      // Award loyalty points (1 point per ₹100)
      const points = Math.floor(payment.amount / 100);
      await prisma.user.update({
        where: { id: payment.userId },
        data: { loyaltyPoints: { increment: points } }
      });

      return {
        success: true,
        status: 'SUCCESS',
        payment: updatedPayment,
        loyaltyPointsEarned: points,
        message: '🎉 Payment successful! Booking confirmed.',
        demo: true
      };
    } else {
      // Update payment to FAILED
      const updatedPayment = await prisma.payment.update({
        where: { transactionId },
        data: { status: 'FAILED' }
      });

      return {
        success: false,
        status: 'FAILED',
        payment: updatedPayment,
        message: 'Payment failed. Please try again with a different method.',
        demo: true
      };
    }
  }

  // ═══════════════════════════════════════════════
  // PROCESS REFUND
  // ═══════════════════════════════════════════════
  async processRefund(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: { where: { status: 'SUCCESS' } } }
    });

    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    if (booking.userId !== userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });

    const successPayment = booking.payments[0];
    if (!successPayment) throw Object.assign(new Error('No successful payment found'), { statusCode: 400 });

    // Calculate refund based on cancellation policy
    let refundPercent = 0;
    const entityTime = booking.checkIn || new Date(Date.now() + 72 * 60 * 60 * 1000);
    const hoursUntil = (new Date(entityTime) - new Date()) / (1000 * 60 * 60);

    if (hoursUntil > 48) refundPercent = 90;
    else if (hoursUntil > 24) refundPercent = 50;
    else refundPercent = 0;

    // Free cancellation policy override
    if (booking.hotel) {
      const hotel = await prisma.hotel.findUnique({ where: { id: booking.hotelId } });
      if (hotel?.cancellationPolicy === 'FREE_CANCELLATION') refundPercent = 100;
    }

    const refundAmount = Math.round(successPayment.amount * (refundPercent / 100));

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: successPayment.id },
      data: {
        status: refundPercent === 100 ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount,
        refundReason: 'Customer cancelled',
        refundedAt: new Date()
      }
    });

    // Add travel credits
    if (refundAmount > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { travelCredits: { increment: refundAmount } }
      });
    }

    return {
      success: true,
      refundAmount,
      refundPercent,
      payment: updatedPayment,
      message: `Refund of ₹${refundAmount} (${refundPercent}%) processed. Added to travel credits.`,
      demo: true
    };
  }

  // ─── HELPERS ───────────────────────────────────
  normalizeMethod(method) {
    const upper = (method || 'CARD').toUpperCase();
    if (['VISA', 'MASTERCARD', 'RUPAY'].includes(upper)) return 'CARD';
    if (['PAYTM', 'GPAY', 'PHONEPE'].includes(upper)) return 'UPI';
    if (['CARD', 'UPI', 'NETBANKING', 'WALLET', 'EMI'].includes(upper)) return upper;
    return 'CARD';
  }

  getMethodDetail(method) {
    const upper = (method || '').toUpperCase();
    const details = {
      'VISA': 'VISA ending 4242',
      'MASTERCARD': 'Mastercard ending 5555',
      'RUPAY': 'RuPay ending 6521',
      'PAYTM': 'UPI: user@paytm',
      'GPAY': 'UPI: user@oksbi',
      'PHONEPE': 'UPI: user@ybl',
      'UPI': 'UPI: user@upi',
      'NETBANKING': 'SBI Net Banking',
      'WALLET': 'TravelNest Wallet',
      'EMI': 'EMI - 3 months @ 0% interest',
      'CARD': 'VISA ending 4242'
    };
    return details[upper] || 'Demo Payment';
  }

  // Get payment status
  async getPaymentStatus(transactionId) {
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        booking: { select: { bookingRef: true, status: true, bookingType: true } }
      }
    });
    if (!payment) throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    return { success: true, data: payment };
  }
}

module.exports = new PaymentService();
