const prisma = require('../utils/prisma');
const { redis } = require('../utils/redis');
const crypto = require('crypto');

// Helper: parse JSON string fields from SQLite
function parseJsonField(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

class SearchService {
  // ═══════════════════════════════════════════════
  // FLIGHT SEARCH
  // ═══════════════════════════════════════════════
  async searchFlights(params) {
    const {
      from, to, date, returnDate, adults = 1, children = 0,
      infants = 0, seatClass = 'ECONOMY',
      airlines, maxPrice, maxStops, departureTimeRange,
      maxDuration, sortBy = 'price', page = 1, limit = 20
    } = params;

    // If no from/to, return all upcoming flights
    const where = { active: true };

    if (from) {
      where.OR = [
        { origin: { contains: from.toUpperCase() } },
        { originCity: { contains: from } }
      ];
    }

    if (to) {
      where.AND = [{
        OR: [
          { destination: { contains: to.toUpperCase() } },
          { destinationCity: { contains: to } }
        ]
      }];
    }

    // Date filter — only if valid date provided
    if (date && !isNaN(new Date(date).getTime())) {
      const searchDate = new Date(date);
      const dayStart = new Date(searchDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(searchDate);
      dayEnd.setHours(23, 59, 59, 999);
      where.departureTime = { gte: dayStart, lte: dayEnd };
    } else {
      // Show upcoming flights
      where.departureTime = { gte: new Date() };
    }

    // Filters
    if (airlines && airlines.length > 0) {
      where.airlineCode = { in: Array.isArray(airlines) ? airlines : [airlines] };
    }
    if (maxStops !== undefined && maxStops !== '') {
      where.stops = { lte: parseInt(maxStops) };
    }
    if (maxDuration) {
      where.duration = { lte: parseInt(maxDuration) };
    }

    const priceField = seatClass === 'BUSINESS' ? 'businessCurrentPrice' :
                       seatClass === 'FIRST_CLASS' ? 'firstClassCurrentPrice' :
                       'economyCurrentPrice';
    if (maxPrice && maxPrice !== '') {
      where[priceField] = { lte: parseFloat(maxPrice) };
    }

    // Sort
    let orderBy = {};
    switch (sortBy) {
      case 'price': orderBy[priceField] = 'asc'; break;
      case 'price-desc': orderBy[priceField] = 'desc'; break;
      case 'duration': orderBy = { duration: 'asc' }; break;
      case 'departure': orderBy = { departureTime: 'asc' }; break;
      case 'arrival': orderBy = { arrivalTime: 'asc' }; break;
      default: orderBy[priceField] = 'asc';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [flights, total] = await Promise.all([
      prisma.flight.findMany({ where, orderBy, skip, take: parseInt(limit) }),
      prisma.flight.count({ where })
    ]);

    const totalPassengers = parseInt(adults) + parseInt(children);
    const results = flights.map(f => ({
      ...f,
      pricePerPerson: f[priceField],
      totalPrice: f[priceField] * totalPassengers,
      priceChange: f.economyBasePrice ? ((f[priceField] - f.economyBasePrice) / f.economyBasePrice * 100).toFixed(1) : '0',
      seatsLeft: seatClass === 'BUSINESS' ? f.businessSeatsLeft :
                 seatClass === 'FIRST_CLASS' ? f.firstClassSeatsLeft :
                 f.economySeatsLeft
    }));

    return {
      success: true,
      data: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      meta: { from: from || '', to: to || '', date: date || '', passengers: { adults: parseInt(adults), children: parseInt(children), infants: parseInt(infants) }, class: seatClass }
    };
  }

  // Calendar search
  async searchFlightCalendar({ from, to }) {
    if (!from || !to) return { success: true, data: [] };
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      const cheapest = await prisma.flight.findFirst({
        where: { origin: from.toUpperCase(), destination: to.toUpperCase(), departureTime: { gte: dayStart, lte: dayEnd }, active: true },
        orderBy: { economyCurrentPrice: 'asc' },
        select: { economyCurrentPrice: true }
      });
      dates.push({ date: dayStart.toISOString().split('T')[0], cheapestPrice: cheapest?.economyCurrentPrice || null });
    }
    return { success: true, data: dates };
  }

  // ═══════════════════════════════════════════════
  // HOTEL SEARCH
  // ═══════════════════════════════════════════════
  async searchHotels(params) {
    const {
      city, checkin, checkout, rooms = 1,
      adults = 2, children = 0, starRating, priceRange,
      amenities, sortBy = 'recommended', page = 1, limit = 20
    } = params;

    const where = { active: true };

    if (city) {
      where.city = { contains: city };
    }

    if (starRating && starRating.length > 0) {
      where.starRating = { in: (Array.isArray(starRating) ? starRating : [starRating]).map(Number) };
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      where.basePrice = {};
      if (min) where.basePrice.gte = min;
      if (max) where.basePrice.lte = max;
    }

    const nights = checkin && checkout ?
      Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24))) : 1;

    let orderBy = {};
    switch (sortBy) {
      case 'price-low': orderBy = { basePrice: 'asc' }; break;
      case 'price-high': orderBy = { basePrice: 'desc' }; break;
      case 'rating': orderBy = { starRating: 'desc' }; break;
      default: orderBy = { starRating: 'desc' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        include: {
          roomTypes: { where: { available: true }, orderBy: { currentPrice: 'asc' }, take: 3 },
          reviews: { select: { rating: true }, take: 100 }
        },
        orderBy, skip, take: parseInt(limit)
      }),
      prisma.hotel.count({ where })
    ]);

    const results = hotels.map(hotel => {
      const avgRating = hotel.reviews.length > 0
        ? (hotel.reviews.reduce((sum, r) => sum + r.rating, 0) / hotel.reviews.length).toFixed(1)
        : null;
      const cheapestRoom = hotel.roomTypes[0];
      return {
        ...hotel,
        amenities: parseJsonField(hotel.amenities),
        images: parseJsonField(hotel.images),
        roomTypes: hotel.roomTypes.map(rt => ({
          ...rt,
          amenities: parseJsonField(rt.amenities),
          images: parseJsonField(rt.images)
        })),
        reviews: undefined,
        avgRating: avgRating ? parseFloat(avgRating) : null,
        reviewCount: hotel.reviews.length,
        cheapestPrice: cheapestRoom?.currentPrice || hotel.basePrice,
        totalPrice: (cheapestRoom?.currentPrice || hotel.basePrice) * nights * parseInt(rooms),
        nights
      };
    });

    return {
      success: true,
      data: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      meta: { city: city || '', checkin, checkout, nights, rooms: parseInt(rooms), adults: parseInt(adults), children: parseInt(children) }
    };
  }

  // ═══════════════════════════════════════════════
  // TRAIN SEARCH
  // ═══════════════════════════════════════════════
  async searchTrains(params) {
    const {
      from, to, date, quota = 'GENERAL',
      sortBy = 'departure', page = 1, limit = 20
    } = params;

    const where = { active: true };

    // Date filter
    if (date && !isNaN(new Date(date).getTime())) {
      const searchDate = new Date(date);
      const dayStart = new Date(searchDate); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(searchDate); dayEnd.setHours(23, 59, 59, 999);
      where.departureTime = { gte: dayStart, lte: dayEnd };
    } else {
      where.departureTime = { gte: new Date() };
    }

    // Origin filter
    if (from) {
      where.OR = [
        { origin: { contains: from } },
        { originCity: { contains: from } }
      ];
    }

    // Destination filter
    if (to) {
      where.AND = [{
        OR: [
          { destination: { contains: to } },
          { destinationCity: { contains: to } }
        ]
      }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let orderBy = { departureTime: 'asc' };
    if (sortBy === 'duration') orderBy = { duration: 'asc' };
    if (sortBy === 'price') orderBy = { sleeperCurrentPrice: 'asc' };

    const [trains, total] = await Promise.all([
      prisma.train.findMany({ where, orderBy, skip, take: parseInt(limit) }),
      prisma.train.count({ where })
    ]);

    const tatkalSurcharge = quota === 'TATKAL' ? 500 : 0;
    const results = trains.map(train => ({
      ...train,
      quota,
      tatkalSurcharge,
      classes: [
        train.sleeperCurrentPrice ? { name: 'SL', price: train.sleeperCurrentPrice + tatkalSurcharge, seats: train.sleeperSeatsLeft } : null,
        train.ac3CurrentPrice ? { name: '3A', price: train.ac3CurrentPrice + tatkalSurcharge, seats: train.ac3SeatsLeft } : null,
        train.ac2CurrentPrice ? { name: '2A', price: train.ac2CurrentPrice + tatkalSurcharge, seats: train.ac2SeatsLeft } : null,
        train.ac1CurrentPrice ? { name: '1A', price: train.ac1CurrentPrice + tatkalSurcharge, seats: train.ac1SeatsLeft } : null,
        train.ccCurrentPrice ? { name: 'CC', price: train.ccCurrentPrice + tatkalSurcharge, seats: train.ccSeatsLeft } : null,
        train.ecCurrentPrice ? { name: 'EC', price: train.ecCurrentPrice + tatkalSurcharge, seats: train.ecSeatsLeft } : null,
      ].filter(Boolean)
    }));

    return {
      success: true,
      data: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      meta: { from: from || '', to: to || '', date: date || '', quota }
    };
  }

  // ═══════════════════════════════════════════════
  // BUS SEARCH
  // ═══════════════════════════════════════════════
  async searchBuses(params) {
    const {
      from, to, date, busType, operator,
      maxPrice, sortBy = 'departure', page = 1, limit = 20
    } = params;

    const where = { active: true };

    // Date filter
    if (date && !isNaN(new Date(date).getTime())) {
      const searchDate = new Date(date);
      const dayStart = new Date(searchDate); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(searchDate); dayEnd.setHours(23, 59, 59, 999);
      where.departureTime = { gte: dayStart, lte: dayEnd };
    } else {
      where.departureTime = { gte: new Date() };
    }

    if (from) {
      where.OR = [
        { origin: { contains: from } },
        { originCity: { contains: from } }
      ];
    }

    if (to) {
      where.AND = [{
        OR: [
          { destination: { contains: to } },
          { destinationCity: { contains: to } }
        ]
      }];
    }

    if (busType) where.type = busType;
    if (operator && operator.length > 0) {
      where.operator = { in: Array.isArray(operator) ? operator : [operator] };
    }
    if (maxPrice && maxPrice !== '') where.currentPrice = { lte: parseFloat(maxPrice) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let orderBy = { departureTime: 'asc' };
    if (sortBy === 'price') orderBy = { currentPrice: 'asc' };
    if (sortBy === 'duration') orderBy = { duration: 'asc' };

    const [buses, total] = await Promise.all([
      prisma.bus.findMany({ where, orderBy, skip, take: parseInt(limit) }),
      prisma.bus.count({ where })
    ]);

    // Parse JSON string fields
    const results = buses.map(b => ({
      ...b,
      amenities: parseJsonField(b.amenities),
      boardingPoints: parseJsonField(b.boardingPoints),
      droppingPoints: parseJsonField(b.droppingPoints)
    }));

    return {
      success: true,
      data: results,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      meta: { from: from || '', to: to || '', date: date || '' }
    };
  }

  // ═══════════════════════════════════════════════
  // AUTOCOMPLETE
  // ═══════════════════════════════════════════════
  async autocomplete(query, type = 'city') {
    const q = (query || '').toLowerCase();
    if (!q) return { success: true, data: [] };

    const cities = [
      { name: 'New Delhi', code: 'DEL', state: 'Delhi', country: 'India' },
      { name: 'Mumbai', code: 'BOM', state: 'Maharashtra', country: 'India' },
      { name: 'Bangalore', code: 'BLR', state: 'Karnataka', country: 'India' },
      { name: 'Chennai', code: 'MAA', state: 'Tamil Nadu', country: 'India' },
      { name: 'Kolkata', code: 'CCU', state: 'West Bengal', country: 'India' },
      { name: 'Hyderabad', code: 'HYD', state: 'Telangana', country: 'India' },
      { name: 'Ahmedabad', code: 'AMD', state: 'Gujarat', country: 'India' },
      { name: 'Pune', code: 'PNQ', state: 'Maharashtra', country: 'India' },
      { name: 'Goa', code: 'GOI', state: 'Goa', country: 'India' },
      { name: 'Jaipur', code: 'JAI', state: 'Rajasthan', country: 'India' },
      { name: 'Lucknow', code: 'LKO', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Patna', code: 'PAT', state: 'Bihar', country: 'India' },
      { name: 'Kochi', code: 'COK', state: 'Kerala', country: 'India' },
      { name: 'Chandigarh', code: 'IXC', state: 'Punjab', country: 'India' },
      { name: 'Varanasi', code: 'VNS', state: 'Uttar Pradesh', country: 'India' },
      { name: 'Amritsar', code: 'ATQ', state: 'Punjab', country: 'India' },
      { name: 'Udaipur', code: 'UDR', state: 'Rajasthan', country: 'India' },
      { name: 'Bhopal', code: 'BHO', state: 'Madhya Pradesh', country: 'India' },
      { name: 'Indore', code: 'IDR', state: 'Madhya Pradesh', country: 'India' },
      { name: 'Srinagar', code: 'SXR', state: 'Jammu & Kashmir', country: 'India' },
      { name: 'Dubai', code: 'DXB', state: 'Dubai', country: 'UAE' },
      { name: 'Singapore', code: 'SIN', state: 'Singapore', country: 'Singapore' },
      { name: 'London', code: 'LHR', state: 'England', country: 'UK' },
      { name: 'New York', code: 'JFK', state: 'New York', country: 'USA' },
      { name: 'Sydney', code: 'SYD', state: 'NSW', country: 'Australia' },
      { name: 'Bangkok', code: 'BKK', state: 'Bangkok', country: 'Thailand' },
      { name: 'Kuala Lumpur', code: 'KUL', state: 'KL', country: 'Malaysia' },
    ];

    const filtered = cities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    ).slice(0, 10);

    return { success: true, data: filtered };
  }

  // ─── HELPERS ───────────────────────────────────
  hashQuery(params) {
    return crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
  }

  async trackSearch(type, query) {
    try {
      const key = `searches:count:${type}:${(query && (query.from || query.city)) || 'unknown'}`;
      await redis.incr(key);
      await redis.expire(key, 3600);
    } catch {}
  }
}

module.exports = new SearchService();
