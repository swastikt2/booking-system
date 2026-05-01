const cron = require('node-cron');
const prisma = require('../utils/prisma');
const { redis } = require('../utils/redis');

class PriceFluctuationAgent {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Hotel prices — every 3 minutes
    cron.schedule('*/3 * * * *', () => this.fluctuateHotelPrices());

    // Flight prices — every 2 minutes
    cron.schedule('*/2 * * * *', () => this.fluctuateFlightPrices());

    // Train prices — every 5 minutes
    cron.schedule('*/5 * * * *', () => this.fluctuateTrainPrices());

    // Bus prices — every 5 minutes
    cron.schedule('*/5 * * * *', () => this.fluctuateBusPrices());

    // Push updates to clients — every 1 minute
    cron.schedule('*/1 * * * *', () => this.pushPriceUpdates());

    console.log('📈 Price fluctuation cron jobs scheduled');
  }

  // ─── DEMAND CALCULATION ────────────────────────
  async calculateDemandScore(entityId, entityType) {
    try {
      const key = `searches:count:${entityType}:${entityId}`;
      const searchCount = parseInt(await redis.get(key) || '0');

      if (searchCount > 100) return 1.4;
      if (searchCount > 50) return 1.25;
      if (searchCount > 10) return 1.1;
      return 1.0;
    } catch {
      return 1.0;
    }
  }

  // ─── SEASON MULTIPLIER ────────────────────────
  getSeasonMultiplier() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDay(); // 0=Sun, 6=Sat

    // Weekend surcharge
    const weekendMultiplier = (day === 0 || day === 6) ? 1.1 : 1.0;

    // Peak season: Dec-Jan, May-Jun (holidays)
    let seasonMultiplier = 1.0;
    if ([12, 1].includes(month)) seasonMultiplier = 1.25;
    else if ([5, 6].includes(month)) seasonMultiplier = 1.15;
    else if ([10, 11].includes(month)) seasonMultiplier = 1.1; // Diwali/Dussehra
    else if ([7, 8].includes(month)) seasonMultiplier = 0.9; // Monsoon off-season

    return seasonMultiplier * weekendMultiplier;
  }

  // ─── TIME MULTIPLIER ──────────────────────────
  getTimeMultiplier(departureTime) {
    if (!departureTime) return 1.0;
    const hoursUntil = (new Date(departureTime) - new Date()) / (1000 * 60 * 60);

    if (hoursUntil < 2) return 0.7;    // Last minute discount
    if (hoursUntil < 6) return 1.5;    // Urgency pricing
    if (hoursUntil < 24) return 1.3;   // Day-of pricing
    if (hoursUntil < 72) return 1.15;  // Near-term
    return 1.0;                         // Normal
  }

  // ─── OCCUPANCY MULTIPLIER ─────────────────────
  getOccupancyMultiplier(available, total) {
    const occupancyRate = 1 - (available / total);
    if (occupancyRate > 0.9) return 1.4;    // >90% booked
    if (occupancyRate > 0.8) return 1.25;   // >80% booked
    if (occupancyRate > 0.6) return 1.1;    // >60% booked
    if (occupancyRate < 0.2) return 0.85;   // Low demand discount
    return 1.0;
  }

  // ─── RANDOM MARKET SIMULATION ─────────────────
  getMarketMultiplier() {
    // Random ±10% market fluctuation
    return 0.9 + (Math.random() * 0.2);
  }

  // ─── CALCULATE NEW PRICE ──────────────────────
  calculateNewPrice(basePrice, factors) {
    const { demand, occupancy, time, season, market } = factors;
    let newPrice = basePrice * demand * occupancy * time * season * market;

    // Cap: min 50% of base, max 300% of base
    newPrice = Math.max(basePrice * 0.5, newPrice);
    newPrice = Math.min(basePrice * 3.0, newPrice);

    // Round to nearest 10
    return Math.round(newPrice / 10) * 10;
  }

  // ═══════════════════════════════════════════════
  // HOTEL PRICE FLUCTUATION
  // ═══════════════════════════════════════════════
  async fluctuateHotelPrices() {
    try {
      const roomTypes = await prisma.roomType.findMany({
        where: { available: true },
        include: { hotel: { select: { id: true, totalRooms: true, availableRooms: true } } }
      });

      const updates = [];
      for (const room of roomTypes) {
        const demand = await this.calculateDemandScore(room.hotelId, 'HOTEL');
        const occupancy = this.getOccupancyMultiplier(room.availableRooms, room.totalRooms);
        const season = this.getSeasonMultiplier();
        const market = this.getMarketMultiplier();

        const newPrice = this.calculateNewPrice(room.basePrice, {
          demand, occupancy, time: 1.0, season, market
        });

        const oldPrice = room.currentPrice;
        if (newPrice !== oldPrice) {
          updates.push({
            id: room.id,
            hotelId: room.hotelId,
            newPrice,
            oldPrice,
            changePercent: ((newPrice - oldPrice) / oldPrice * 100).toFixed(1)
          });

          await prisma.roomType.update({
            where: { id: room.id },
            data: { currentPrice: newPrice }
          });

          // Cache in Redis
          await redis.set(`prices:hotel:${room.hotelId}:${room.id}`, JSON.stringify({
            currentPrice: newPrice,
            basePrice: room.basePrice,
            updatedAt: new Date().toISOString()
          }), 'EX', 300);

          // Record price history (sample 20%)
          if (Math.random() < 0.2) {
            await prisma.priceHistory.create({
              data: {
                entityType: 'HOTEL',
                entityId: room.hotelId,
                price: newPrice,
                seatClass: room.name
              }
            });
          }
        }
      }

      if (updates.length > 0) {
        console.log(`📈 Updated ${updates.length} hotel room prices`);
      }
    } catch (err) {
      console.error('❌ Hotel price fluctuation error:', err.message);
    }
  }

  // ═══════════════════════════════════════════════
  // FLIGHT PRICE FLUCTUATION
  // ═══════════════════════════════════════════════
  async fluctuateFlightPrices() {
    try {
      const flights = await prisma.flight.findMany({
        where: {
          active: true,
          departureTime: { gt: new Date() }
        }
      });

      const updates = [];
      for (const flight of flights) {
        const demand = await this.calculateDemandScore(flight.id, 'FLIGHT');
        const season = this.getSeasonMultiplier();
        const market = this.getMarketMultiplier();
        const time = this.getTimeMultiplier(flight.departureTime);

        // Economy
        const econOccupancy = this.getOccupancyMultiplier(
          flight.economySeatsLeft, flight.totalSeats * 0.67
        );
        const newEconPrice = this.calculateNewPrice(flight.economyBasePrice, {
          demand, occupancy: econOccupancy, time, season, market
        });

        const updateData = { economyCurrentPrice: newEconPrice };

        // Business
        if (flight.businessBasePrice) {
          const bizOccupancy = this.getOccupancyMultiplier(
            flight.businessSeatsLeft, flight.totalSeats * 0.2
          );
          updateData.businessCurrentPrice = this.calculateNewPrice(flight.businessBasePrice, {
            demand, occupancy: bizOccupancy, time, season, market
          });
        }

        // First Class
        if (flight.firstClassBasePrice) {
          const fcOccupancy = this.getOccupancyMultiplier(
            flight.firstClassSeatsLeft, flight.totalSeats * 0.06
          );
          updateData.firstClassCurrentPrice = this.calculateNewPrice(flight.firstClassBasePrice, {
            demand, occupancy: fcOccupancy, time, season, market
          });
        }

        const oldPrice = flight.economyCurrentPrice;
        if (newEconPrice !== oldPrice) {
          updates.push({
            id: flight.id,
            flightNumber: flight.flightNumber,
            newPrice: newEconPrice,
            oldPrice,
            changePercent: ((newEconPrice - oldPrice) / oldPrice * 100).toFixed(1)
          });
        }

        await prisma.flight.update({
          where: { id: flight.id },
          data: updateData
        });

        // Cache
        await redis.set(`prices:flight:${flight.id}`, JSON.stringify({
          economy: newEconPrice,
          business: updateData.businessCurrentPrice || null,
          firstClass: updateData.firstClassCurrentPrice || null,
          updatedAt: new Date().toISOString()
        }), 'EX', 120);

        // Price history (sample)
        if (Math.random() < 0.15) {
          await prisma.priceHistory.create({
            data: {
              entityType: 'FLIGHT',
              entityId: flight.id,
              price: newEconPrice,
              seatClass: 'ECONOMY'
            }
          });
        }
      }

      if (updates.length > 0) {
        console.log(`✈️  Updated ${updates.length} flight prices`);
      }
    } catch (err) {
      console.error('❌ Flight price fluctuation error:', err.message);
    }
  }

  // ═══════════════════════════════════════════════
  // TRAIN PRICE FLUCTUATION
  // ═══════════════════════════════════════════════
  async fluctuateTrainPrices() {
    try {
      const trains = await prisma.train.findMany({
        where: { active: true, departureTime: { gt: new Date() } }
      });

      for (const train of trains) {
        const demand = await this.calculateDemandScore(train.id, 'TRAIN');
        const season = this.getSeasonMultiplier();
        const market = 0.95 + (Math.random() * 0.1); // Trains fluctuate less
        const time = this.getTimeMultiplier(train.departureTime);

        const updateData = {};
        const classes = [
          { base: 'sleeperBasePrice', current: 'sleeperCurrentPrice', seats: 'sleeperSeatsLeft', total: 200 },
          { base: 'ac3BasePrice', current: 'ac3CurrentPrice', seats: 'ac3SeatsLeft', total: 60 },
          { base: 'ac2BasePrice', current: 'ac2CurrentPrice', seats: 'ac2SeatsLeft', total: 40 },
          { base: 'ac1BasePrice', current: 'ac1CurrentPrice', seats: 'ac1SeatsLeft', total: 20 },
          { base: 'ccBasePrice', current: 'ccCurrentPrice', seats: 'ccSeatsLeft', total: 70 },
          { base: 'ecBasePrice', current: 'ecCurrentPrice', seats: 'ecSeatsLeft', total: 50 },
        ];

        for (const cls of classes) {
          if (train[cls.base]) {
            const occupancy = this.getOccupancyMultiplier(train[cls.seats] || cls.total, cls.total);
            updateData[cls.current] = this.calculateNewPrice(train[cls.base], {
              demand, occupancy, time, season, market
            });
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.train.update({
            where: { id: train.id },
            data: updateData
          });
        }
      }
    } catch (err) {
      console.error('❌ Train price fluctuation error:', err.message);
    }
  }

  // ═══════════════════════════════════════════════
  // BUS PRICE FLUCTUATION
  // ═══════════════════════════════════════════════
  async fluctuateBusPrices() {
    try {
      const buses = await prisma.bus.findMany({
        where: { active: true, departureTime: { gt: new Date() } }
      });

      for (const bus of buses) {
        const demand = await this.calculateDemandScore(bus.id, 'BUS');
        const occupancy = this.getOccupancyMultiplier(bus.availableSeats, bus.totalSeats);
        const season = this.getSeasonMultiplier();
        const market = this.getMarketMultiplier();
        const time = this.getTimeMultiplier(bus.departureTime);

        const newPrice = this.calculateNewPrice(bus.basePrice, {
          demand, occupancy, time, season, market
        });

        await prisma.bus.update({
          where: { id: bus.id },
          data: { currentPrice: newPrice }
        });
      }
    } catch (err) {
      console.error('❌ Bus price fluctuation error:', err.message);
    }
  }

  // ═══════════════════════════════════════════════
  // PUSH REAL-TIME UPDATES
  // ═══════════════════════════════════════════════
  async pushPriceUpdates() {
    try {
      // Get recently updated hotels
      const recentRooms = await prisma.roomType.findMany({
        where: {
          updatedAt: { gte: new Date(Date.now() - 60000) }
        },
        include: { hotel: { select: { id: true, name: true } } },
        take: 50
      });

      for (const room of recentRooms) {
        this.io.to(`hotel:${room.hotelId}`).emit('price:update', {
          type: 'HOTEL',
          id: room.hotelId,
          roomId: room.id,
          roomName: room.name,
          hotelName: room.hotel.name,
          newPrice: room.currentPrice,
          oldPrice: room.basePrice,
          changePercent: ((room.currentPrice - room.basePrice) / room.basePrice * 100).toFixed(1)
        });

        // Low availability alerts
        if (room.availableRooms <= 3 && room.availableRooms > 0) {
          this.io.to(`hotel:${room.hotelId}`).emit('availability:low', {
            type: 'HOTEL',
            id: room.hotelId,
            message: `Only ${room.availableRooms} room${room.availableRooms > 1 ? 's' : ''} left!`
          });
        }
      }

      // Get recently updated flights
      const recentFlights = await prisma.flight.findMany({
        where: {
          updatedAt: { gte: new Date(Date.now() - 60000) },
          departureTime: { gt: new Date() }
        },
        take: 50
      });

      for (const flight of recentFlights) {
        this.io.to(`flight:${flight.id}`).emit('price:update', {
          type: 'FLIGHT',
          id: flight.id,
          flightNumber: flight.flightNumber,
          newPrice: flight.economyCurrentPrice,
          oldPrice: flight.economyBasePrice,
          changePercent: ((flight.economyCurrentPrice - flight.economyBasePrice) / flight.economyBasePrice * 100).toFixed(1)
        });

        if (flight.economySeatsLeft <= 5 && flight.economySeatsLeft > 0) {
          this.io.to(`flight:${flight.id}`).emit('availability:low', {
            type: 'FLIGHT',
            id: flight.id,
            message: `Only ${flight.economySeatsLeft} seats left at this price!`
          });
        }
      }
    } catch (err) {
      console.error('❌ Price push error:', err.message);
    }
  }
}

module.exports = { PriceFluctuationAgent };
