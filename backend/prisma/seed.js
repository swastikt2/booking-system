const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// ─── CITY DATA ───────────────────────────────────
const CITIES = [
  { name: 'New Delhi', code: 'DEL', station: 'NDLS', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', code: 'BOM', station: 'BCT', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', code: 'BLR', station: 'SBC', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', code: 'MAA', station: 'MAS', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', code: 'CCU', station: 'HWH', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Hyderabad', code: 'HYD', station: 'SC', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Ahmedabad', code: 'AMD', station: 'ADI', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Pune', code: 'PNQ', station: 'PUNE', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Goa', code: 'GOI', station: 'MAO', state: 'Goa', lat: 15.2993, lng: 74.1240 },
  { name: 'Jaipur', code: 'JAI', station: 'JP', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', code: 'LKO', station: 'LKO', state: 'UP', lat: 26.8467, lng: 80.9462 },
  { name: 'Patna', code: 'PAT', station: 'PNBE', state: 'Bihar', lat: 25.6093, lng: 85.1376 },
  { name: 'Kochi', code: 'COK', station: 'ERS', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Chandigarh', code: 'IXC', station: 'CDG', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { name: 'Varanasi', code: 'VNS', station: 'BSB', state: 'UP', lat: 25.3176, lng: 82.9739 },
  { name: 'Udaipur', code: 'UDR', station: 'UDZ', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
  { name: 'Amritsar', code: 'ATQ', station: 'ASR', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Bhopal', code: 'BHO', station: 'BPL', state: 'MP', lat: 23.2599, lng: 77.4126 },
  { name: 'Indore', code: 'IDR', station: 'INDB', state: 'MP', lat: 22.7196, lng: 75.8577 },
  { name: 'Srinagar', code: 'SXR', station: 'SRNR', state: 'J&K', lat: 34.0837, lng: 74.7973 },
];

const INTL_CITIES = [
  { name: 'Dubai', code: 'DXB' }, { name: 'Singapore', code: 'SIN' },
  { name: 'London', code: 'LHR' }, { name: 'New York', code: 'JFK' },
  { name: 'Bangkok', code: 'BKK' }, { name: 'Kuala Lumpur', code: 'KUL' },
  { name: 'Sydney', code: 'SYD' },
];

const AIRLINES = [
  { name: 'IndiGo', code: '6E' }, { name: 'Air India', code: 'AI' },
  { name: 'SpiceJet', code: 'SG' }, { name: 'Vistara', code: 'UK' },
  { name: 'GoFirst', code: 'G8' }, { name: 'AirAsia India', code: 'I5' },
];

const HOTEL_CHAINS = ['Taj', 'Oberoi', 'ITC', 'Marriott', 'Hyatt', 'Radisson', 'Lemon Tree', 'OYO', 'FabHotel', 'Treebo', 'The Leela', 'Holiday Inn'];
const ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Superior Room', 'Suite', 'Presidential Suite', 'Executive Room'];
const AMENITIES_LIST = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Room Service', 'Laundry', 'AC', 'TV', 'Breakfast', 'Airport Shuttle', 'Business Center'];
const TRAIN_NAMES = ['Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Garib Rath', 'Humsafar Express', 'Tejas Express', 'Vande Bharat Express', 'Superfast Express', 'Jan Shatabdi', 'Sampark Kranti'];
const BUS_OPERATORS = ['VRL Travels', 'Orange Travels', 'Neeta Travels', 'SRS Travels', 'KSRTC', 'MSRTC', 'RSRTC', 'Paulo Travels', 'Parveen Travels', 'Hans Travels'];

// ─── HELPERS ─────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const slug = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const futureDate = (daysMin, daysMax) => {
  const d = new Date();
  d.setDate(d.getDate() + rand(daysMin, daysMax));
  d.setHours(rand(5, 23), rand(0, 3) * 15, 0, 0);
  return d;
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // ═══ USERS ═══
  const passHash = await bcrypt.hash('Demo@123', 12);
  const adminHash = await bcrypt.hash('Admin@123', 12);

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'demo@mahasorjourney.com' }, update: {}, create: { email: 'demo@mahasorjourney.com', passwordHash: passHash, fullName: 'Demo User', phone: '+91-9876543210', tier: 'GOLD', loyaltyPoints: 2500, travelCredits: 500 } }),
    prisma.user.upsert({ where: { email: 'admin@mahasorjourney.com' }, update: {}, create: { email: 'admin@mahasorjourney.com', passwordHash: adminHash, fullName: 'Admin User', phone: '+91-9876543211', role: 'ADMIN', tier: 'PLATINUM', loyaltyPoints: 10000 } }),
    prisma.user.upsert({ where: { email: 'john@mahasorjourney.com' }, update: {}, create: { email: 'john@mahasorjourney.com', passwordHash: passHash, fullName: 'John Sharma', phone: '+91-9876543212', tier: 'SILVER', loyaltyPoints: 800 } }),
    prisma.user.upsert({ where: { email: 'priya@mahasorjourney.com' }, update: {}, create: { email: 'priya@mahasorjourney.com', passwordHash: passHash, fullName: 'Priya Patel', phone: '+91-9876543213', loyaltyPoints: 350 } }),
    prisma.user.upsert({ where: { email: 'rahul@mahasorjourney.com' }, update: {}, create: { email: 'rahul@mahasorjourney.com', passwordHash: passHash, fullName: 'Rahul Verma', phone: '+91-9876543214', loyaltyPoints: 150 } }),
  ]);
  console.log(`✅ ${users.length} users seeded`);

  // ═══ HOTELS ═══
  let hotelCount = 0;
  for (const city of CITIES) {
    const count = rand(8, 12);
    for (let i = 0; i < count; i++) {
      const stars = rand(1, 5);
      const chain = pick(HOTEL_CHAINS);
      const name = `${chain} ${city.name} ${['Grand', 'Plaza', 'Resort', 'Inn', 'Residency', 'Palace', 'Heights'][rand(0, 6)]}`;
      const basePrices = { 1: rand(800, 1500), 2: rand(1500, 2500), 3: rand(2500, 5000), 4: rand(5000, 12000), 5: rand(12000, 50000) };
      const bp = basePrices[stars];
      const numAmenities = rand(4, 10);
      const hotelAmenities = [];
      const amenCopy = [...AMENITIES_LIST];
      for (let a = 0; a < numAmenities; a++) { const idx = rand(0, amenCopy.length - 1); hotelAmenities.push(amenCopy.splice(idx, 1)[0]); }

      try {
        const hotel = await prisma.hotel.create({
          data: {
            name, slug: slug(name) + '-' + rand(100, 999), description: `A beautiful ${stars}-star property in the heart of ${city.name}. Experience luxury and comfort at ${name}.`,
            starRating: stars, address: `${rand(1, 500)} ${['MG Road', 'Park Street', 'Brigade Road', 'Marine Drive', 'Ring Road', 'Station Road'][rand(0, 5)]}, ${city.name}`,
            city: city.name, state: city.state, country: 'India',
            lat: city.lat + (Math.random() - 0.5) * 0.1, lng: city.lng + (Math.random() - 0.5) * 0.1,
            amenities: JSON.stringify(hotelAmenities), images: JSON.stringify([`https://picsum.photos/seed/${slug(name)}/800/600`]),
            basePrice: bp, totalRooms: rand(30, 200), availableRooms: rand(5, 50),
            cancellationPolicy: Math.random() > 0.4 ? 'FREE_CANCELLATION' : 'NON_REFUNDABLE',
            featured: Math.random() > 0.8
          }
        });

        // Room types
        const numRooms = rand(3, 6);
        for (let r = 0; r < numRooms; r++) {
          const roomName = ROOM_TYPES[r] || 'Standard Room';
          const multiplier = 1 + r * 0.4;
          const roomBase = Math.round(bp * multiplier);
          await prisma.roomType.create({
            data: {
              hotelId: hotel.id, name: roomName, description: `Spacious ${roomName.toLowerCase()} with modern amenities`,
              maxOccupancy: rand(2, 4), bedType: pick(['SINGLE', 'DOUBLE', 'QUEEN', 'KING']),
              size: rand(20, 80), basePrice: roomBase, currentPrice: roomBase,
              amenities: JSON.stringify(hotelAmenities.slice(0, rand(3, 6))), images: JSON.stringify([]),
              totalRooms: rand(5, 30), availableRooms: rand(1, 15)
            }
          });
        }
        hotelCount++;
      } catch (e) { /* skip duplicate slugs */ }
    }
  }
  console.log(`✅ ${hotelCount} hotels seeded`);

  // ═══ FLIGHTS ═══
  let flightCount = 0;
  const allCodes = CITIES.map(c => c.code);
  for (let i = 0; i < 500; i++) {
    const airline = pick(AIRLINES);
    const originCity = pick(CITIES);
    let destCode, destCityName;
    if (Math.random() > 0.8) {
      const intl = pick(INTL_CITIES);
      destCode = intl.code; destCityName = intl.name;
    } else {
      let dest;
      do { dest = pick(CITIES); } while (dest.code === originCity.code);
      destCode = dest.code; destCityName = dest.name;
    }
    const dep = futureDate(1, 30);
    const dur = rand(60, 300);
    const arr = new Date(dep.getTime() + dur * 60000);
    const econBase = rand(2000, 12000);
    const flightNum = `${airline.code}-${rand(100, 9999)}`;

    try {
      await prisma.flight.create({
        data: {
          flightNumber: flightNum, airline: airline.name, airlineCode: airline.code,
          origin: originCity.code, originCity: originCity.name, destination: destCode, destinationCity: destCityName,
          departureTime: dep, arrivalTime: arr, duration: dur,
          aircraft: pick(['A320', 'B737', 'A321', 'B777', 'ATR72']),
          totalSeats: rand(150, 300), stops: rand(0, 2),
          economyBasePrice: econBase, economyCurrentPrice: econBase,
          businessBasePrice: econBase * 2.5, businessCurrentPrice: econBase * 2.5,
          firstClassBasePrice: econBase * 5, firstClassCurrentPrice: econBase * 5,
          economySeatsLeft: rand(10, 120), businessSeatsLeft: rand(2, 30), firstClassSeatsLeft: rand(0, 10)
        }
      });
      flightCount++;
    } catch (e) { /* skip duplicate flight numbers */ }
  }
  console.log(`✅ ${flightCount} flights seeded`);

  // ═══ TRAINS ═══
  let trainCount = 0;
  for (let i = 0; i < 120; i++) {
    let orig, dest;
    do { orig = pick(CITIES); dest = pick(CITIES); } while (orig.code === dest.code);
    const dep = futureDate(1, 30);
    const dur = rand(180, 1440);
    const arr = new Date(dep.getTime() + dur * 60000);
    const slBase = rand(300, 800);
    const trainNum = `${rand(10000, 99999)}`;
    const trainName = `${orig.name} ${pick(TRAIN_NAMES)}`;

    try {
      await prisma.train.create({
        data: {
          trainNumber: trainNum, trainName, operator: 'Indian Railways',
          origin: orig.station, originCity: orig.name, destination: dest.station, destinationCity: dest.name,
          departureTime: dep, arrivalTime: arr, duration: dur, distance: rand(200, 2500),
          sleeperBasePrice: slBase, sleeperCurrentPrice: slBase, sleeperSeatsLeft: rand(20, 200),
          ac3BasePrice: slBase * 2.2, ac3CurrentPrice: slBase * 2.2, ac3SeatsLeft: rand(5, 60),
          ac2BasePrice: slBase * 3.5, ac2CurrentPrice: slBase * 3.5, ac2SeatsLeft: rand(3, 40),
          ac1BasePrice: slBase * 5, ac1CurrentPrice: slBase * 5, ac1SeatsLeft: rand(1, 20),
          ccBasePrice: slBase * 2.8, ccCurrentPrice: slBase * 2.8, ccSeatsLeft: rand(10, 70),
          ecBasePrice: slBase * 4, ecCurrentPrice: slBase * 4, ecSeatsLeft: rand(5, 50),
        }
      });
      trainCount++;
    } catch (e) {}
  }
  console.log(`✅ ${trainCount} trains seeded`);

  // ═══ BUSES ═══
  let busCount = 0;
  for (let i = 0; i < 160; i++) {
    let orig, dest;
    do { orig = pick(CITIES); dest = pick(CITIES); } while (orig.code === dest.code);
    const dep = futureDate(1, 15);
    const dur = rand(120, 960);
    const arr = new Date(dep.getTime() + dur * 60000);
    const bp = rand(300, 2500);
    const busType = pick(['AC', 'NON_AC', 'SLEEPER', 'AC_SLEEPER', 'VOLVO', 'VOLVO_AC', 'SEMI_SLEEPER']);

    try {
      await prisma.bus.create({
        data: {
          busNumber: `${pick(['KA', 'MH', 'DL', 'TN', 'UP'])}-${rand(10, 99)}-${String.fromCharCode(65 + rand(0, 25))}${String.fromCharCode(65 + rand(0, 25))}-${rand(1000, 9999)}`,
          operator: pick(BUS_OPERATORS), type: busType,
          origin: orig.name, originCity: orig.name, destination: dest.name, destinationCity: dest.name,
          departureTime: dep, arrivalTime: arr, duration: dur,
          totalSeats: rand(30, 50), availableSeats: rand(5, 35),
          basePrice: bp, currentPrice: bp,
          amenities: JSON.stringify(pick([['AC', 'Charging Point'], ['WiFi', 'Blanket', 'Water'], ['AC', 'TV', 'Snacks']])),
          boardingPoints: JSON.stringify([{ name: `${orig.name} Bus Stand`, time: dep.toISOString() }]),
          droppingPoints: JSON.stringify([{ name: `${dest.name} Bus Stand`, time: arr.toISOString() }])
        }
      });
      busCount++;
    } catch (e) {}
  }
  console.log(`✅ ${busCount} buses seeded`);

  // ═══ DEMO BOOKINGS ═══
  const demoUser = users[0];
  const someHotels = await prisma.hotel.findMany({ take: 3 });
  const someFlights = await prisma.flight.findMany({ take: 3 });

  for (const hotel of someHotels) {
    const rooms = await prisma.roomType.findMany({ where: { hotelId: hotel.id }, take: 1 });
    if (rooms.length === 0) continue;
    const ref = `MJ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await prisma.booking.create({
      data: {
        bookingRef: ref, userId: demoUser.id, bookingType: 'HOTEL', status: 'CONFIRMED',
        hotelId: hotel.id, checkIn: futureDate(-10, -5), checkOut: futureDate(-4, -1),
        roomTypeId: rooms[0].id, adults: 2, totalAmount: rooms[0].currentPrice * 3,
        baseAmount: rooms[0].currentPrice * 3, gstAmount: Math.round(rooms[0].currentPrice * 3 * 0.05),
        convenienceFee: 99, paidAt: new Date(Date.now() - rand(1, 30) * 86400000)
      }
    });
  }

  for (const flight of someFlights) {
    const ref = `MJ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await prisma.booking.create({
      data: {
        bookingRef: ref, userId: demoUser.id, bookingType: 'FLIGHT', status: 'CONFIRMED',
        flightId: flight.id, seatClass: 'ECONOMY', adults: 1,
        passengerDetails: JSON.stringify([{ name: 'Demo User', age: 28, gender: 'M' }]),
        totalAmount: flight.economyCurrentPrice, baseAmount: flight.economyCurrentPrice,
        gstAmount: Math.round(flight.economyCurrentPrice * 0.05), convenienceFee: 199,
        paidAt: new Date(Date.now() - rand(1, 20) * 86400000)
      }
    });
  }
  console.log('✅ Demo bookings seeded');

  // ═══ REVIEWS ═══
  const allHotels = await prisma.hotel.findMany({ take: 50, select: { id: true } });
  for (const hotel of allHotels) {
    const numReviews = rand(1, 5);
    for (let r = 0; r < numReviews; r++) {
      const reviewer = pick(users);
      try {
        await prisma.review.create({
          data: {
            userId: reviewer.id, hotelId: hotel.id, rating: rand(3, 5),
            title: pick(['Great stay!', 'Excellent', 'Good value', 'Amazing', 'Would visit again']),
            body: pick(['Had a wonderful experience. Clean rooms and great service.', 'The location was perfect and staff were helpful.', 'Food was excellent. Room was spacious.', 'Good hotel for the price. Recommended!', 'Beautiful property with great amenities.']),
            verifiedStay: Math.random() > 0.3, helpfulCount: rand(0, 50)
          }
        });
      } catch (e) {}
    }
  }
  console.log('✅ Reviews seeded');
  console.log('🎉 Database seeding complete!');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
