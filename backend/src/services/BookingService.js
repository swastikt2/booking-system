const prisma = require('../utils/prisma');
const { redis } = require('../utils/redis');
const { v4: uuidv4 } = require('uuid');

class BookingService {
  // Generate unique booking reference: TN-2024-XXXXXX
  generateBookingRef() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MJ-${year}-${random}`;
  }

  // ═══════════════════════════════════════════════
  // HOLD A BOOKING (15-min TTL)
  // ═══════════════════════════════════════════════
  async holdBooking({ userId, bookingType, entityId, seatDetails, roomDetails }) {
    const holdKey = `hold:${bookingType}:${entityId}:${userId}`;

    // Check if already held by someone
    const existingHold = await redis.get(`hold:${bookingType}:${entityId}:*`);

    const holdData = {
      userId,
      bookingType,
      entityId,
      seatDetails,
      roomDetails,
      heldAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    // Set hold with 15-min TTL
    await redis.set(holdKey, JSON.stringify(holdData), 'EX', 900);

    return {
      success: true,
      holdKey,
      expiresIn: 900,
      expiresAt: holdData.expiresAt,
      message: 'Booking held for 15 minutes. Complete payment to confirm.'
    };
  }

  // ═══════════════════════════════════════════════
  // CREATE A BOOKING
  // ═══════════════════════════════════════════════
  async createBooking(data) {
    const {
      userId, bookingType, entityId, checkIn, checkOut,
      roomTypeId, roomCount, seatNumbers, seatClass,
      passengerDetails, specialRequests,
      adults, children, infants
    } = data;

    const bType = (bookingType || '').toUpperCase();
    const bookingRef = this.generateBookingRef();

    // Calculate pricing
    const pricing = await this.calculatePricing(bType, entityId, {
      checkIn, checkOut, roomTypeId, roomCount, seatNumbers,
      seatClass, adults, children
    });

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId,
        bookingType: bType,
        status: 'PENDING',
        hotelId: bType === 'HOTEL' ? entityId : null,
        flightId: bType === 'FLIGHT' ? entityId : null,
        trainId: bType === 'TRAIN' ? entityId : null,
        busId: bType === 'BUS' ? entityId : null,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        roomTypeId,
        roomCount: roomCount || 1,
        seatNumbers: JSON.stringify(seatNumbers || []),
        seatClass,
        passengerDetails: JSON.stringify(passengerDetails || []),
        specialRequests,
        adults: adults || 1,
        children: children || 0,
        infants: infants || 0,
        baseAmount: pricing.baseAmount,
        gstAmount: pricing.gstAmount,
        convenienceFee: pricing.convenienceFee,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        currency: 'INR',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    return {
      success: true,
      booking,
      pricing,
      message: 'Booking created. Complete payment within 15 minutes.'
    };
  }

  // ═══════════════════════════════════════════════
  // CALCULATE PRICING
  // ═══════════════════════════════════════════════
  async calculatePricing(bookingType, entityId, details) {
    let baseAmount = 0;
    const bType = (bookingType || '').toUpperCase();
    switch (bType) {
      case 'HOTEL': {
        if (!details.roomTypeId) throw Object.assign(new Error('Room type required for hotel booking'), { statusCode: 400 });
        const room = await prisma.roomType.findUnique({ where: { id: details.roomTypeId } });
        if (!room) throw Object.assign(new Error('Room type not found'), { statusCode: 404 });
        const nights = details.checkIn && details.checkOut
          ? Math.ceil((new Date(details.checkOut) - new Date(details.checkIn)) / (1000 * 60 * 60 * 24))
          : 1;
        baseAmount = room.currentPrice * (nights || 1) * (details.roomCount || 1);
        break;
      }
      case 'FLIGHT': {
        const flight = await prisma.flight.findUnique({ where: { id: entityId } });
        if (!flight) throw Object.assign(new Error('Flight not found'), { statusCode: 404 });
        
        const sClass = (details.seatClass || 'ECONOMY').toUpperCase();
        let pricePerSeat = flight.economyCurrentPrice;
        
        if (sClass === 'BUSINESS') pricePerSeat = flight.businessCurrentPrice || flight.economyCurrentPrice * 2.5;
        else if (sClass === 'FIRST_CLASS') pricePerSeat = flight.firstClassCurrentPrice || flight.economyCurrentPrice * 4;
        
        const passengers = (parseInt(details.adults) || 1) + (parseInt(details.children) || 0);
        baseAmount = pricePerSeat * passengers;
        break;
      }
      case 'TRAIN': {
        const train = await prisma.train.findUnique({ where: { id: entityId } });
        if (!train) throw Object.assign(new Error('Train not found'), { statusCode: 404 });
        const classMap = {
          'SL': 'sleeperCurrentPrice', '3A': 'ac3CurrentPrice',
          '2A': 'ac2CurrentPrice', '1A': 'ac1CurrentPrice',
          'CC': 'ccCurrentPrice', 'EC': 'ecCurrentPrice'
        };
        const sClass = (details.seatClass || 'SL').toUpperCase();
        const priceField = classMap[sClass] || 'sleeperCurrentPrice';
        const price = train[priceField] || train.sleeperCurrentPrice || 500;
        const passengers = (parseInt(details.adults) || 1) + (parseInt(details.children) || 0);
        baseAmount = price * passengers;
        break;
      }
      case 'BUS': {
        const bus = await prisma.bus.findUnique({ where: { id: entityId } });
        if (!bus) throw Object.assign(new Error('Bus not found'), { statusCode: 404 });
        const passengers = (parseInt(details.adults) || 1) + (parseInt(details.children) || 0);
        baseAmount = bus.currentPrice * passengers;
        break;
      }
    }

    const gstAmount = Math.round(baseAmount * 0.05); // 5% GST
    const convenienceFee = Math.round(baseAmount * 0.02); // 2% convenience fee
    const discount = 0;
    const totalAmount = baseAmount + gstAmount + convenienceFee - discount;

    return {
      baseAmount: Math.round(baseAmount),
      gstAmount,
      convenienceFee,
      discount,
      totalAmount: Math.round(totalAmount)
    };
  }

  // ═══════════════════════════════════════════════
  // GET USER BOOKINGS
  // ═══════════════════════════════════════════════
  async getUserBookings(userId, { status, page = 1, limit = 10 }) {
    const where = { userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          hotel: { select: { id: true, name: true, city: true, images: true, starRating: true } },
          flight: { select: { id: true, flightNumber: true, airline: true, origin: true, destination: true, originCity: true, destinationCity: true, departureTime: true, arrivalTime: true } },
          train: { select: { id: true, trainNumber: true, trainName: true, originCity: true, destinationCity: true, departureTime: true, arrivalTime: true } },
          bus: { select: { id: true, operator: true, originCity: true, destinationCity: true, departureTime: true, arrivalTime: true } },
          payments: { select: { id: true, status: true, transactionId: true, method: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);

    const parseJson = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } };

    const results = bookings.map(b => ({
      ...b,
      seatNumbers: parseJson(b.seatNumbers),
      passengerDetails: parseJson(b.passengerDetails),
      hotel: b.hotel ? { ...b.hotel, images: parseJson(b.hotel.images) } : null
    }));

    return {
      success: true,
      data: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    };
  }

  // ═══════════════════════════════════════════════
  // GET BOOKING BY REF
  // ═══════════════════════════════════════════════
  async getBookingByRef(bookingRef, userId) {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        hotel: true,
        flight: true,
        train: true,
        bus: true,
        payments: true
      }
    });

    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    if (booking.userId !== userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });

    const parseJson = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } };

    return {
      success: true,
      data: {
        ...booking,
        seatNumbers: parseJson(booking.seatNumbers),
        passengerDetails: parseJson(booking.passengerDetails),
        hotel: booking.hotel ? { ...booking.hotel, images: parseJson(booking.hotel.images), amenities: parseJson(booking.hotel.amenities) } : null,
        flight: booking.flight ? { ...booking.flight } : null,
        train: booking.train ? { ...booking.train } : null,
        bus: booking.bus ? { ...booking.bus, boardingPoints: parseJson(booking.bus.boardingPoints), droppingPoints: parseJson(booking.bus.droppingPoints), amenities: parseJson(booking.bus.amenities) } : null
      }
    };
  }

  // ═══════════════════════════════════════════════
  // CANCEL BOOKING
  // ═══════════════════════════════════════════════
  async cancelBooking(bookingRef, userId) {
    const booking = await prisma.booking.findUnique({ where: { bookingRef } });
    if (!booking) throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    if (booking.userId !== userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
    if (['CANCELLED', 'COMPLETED'].includes(booking.status)) {
      throw Object.assign(new Error('Booking cannot be cancelled'), { statusCode: 400 });
    }

    const updated = await prisma.booking.update({
      where: { bookingRef },
      data: { status: 'CANCELLED', cancelledAt: new Date() }
    });

    // Release held resources
    const bType = (booking.bookingType || '').toUpperCase();
    const entityId = booking.hotelId || booking.flightId || booking.trainId || booking.busId;
    const holdKey = `hold:${bType}:${entityId}:${userId}`;
    await redis.del(holdKey);

    return { success: true, data: updated, message: 'Booking cancelled successfully' };
  }

  // ═══════════════════════════════════════════════
  // CONFIRM BOOKING (after payment)
  // ═══════════════════════════════════════════════
  async confirmBooking(bookingId) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', paidAt: new Date() }
    });
  }
}

module.exports = new BookingService();
