-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "nationality" TEXT,
    "dateOfBirth" DATETIME,
    "passportNumber" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'BASIC',
    "travelCredits" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL DEFAULT 3,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "checkInTime" TEXT NOT NULL DEFAULT '14:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
    "cancellationPolicy" TEXT NOT NULL DEFAULT 'FREE_CANCELLATION',
    "basePrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "totalRooms" INTEGER NOT NULL DEFAULT 50,
    "availableRooms" INTEGER NOT NULL DEFAULT 50,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxOccupancy" INTEGER NOT NULL DEFAULT 2,
    "bedType" TEXT NOT NULL DEFAULT 'DOUBLE',
    "size" INTEGER,
    "basePrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "totalRooms" INTEGER NOT NULL DEFAULT 10,
    "availableRooms" INTEGER NOT NULL DEFAULT 10,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "room_types_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "flights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flightNumber" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "airlineCode" TEXT NOT NULL,
    "airlineLogo" TEXT,
    "origin" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "departureTime" DATETIME NOT NULL,
    "arrivalTime" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "aircraft" TEXT,
    "totalSeats" INTEGER NOT NULL DEFAULT 180,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "stopCities" TEXT NOT NULL DEFAULT '[]',
    "economyBasePrice" REAL NOT NULL,
    "businessBasePrice" REAL,
    "firstClassBasePrice" REAL,
    "economyCurrentPrice" REAL NOT NULL,
    "businessCurrentPrice" REAL,
    "firstClassCurrentPrice" REAL,
    "economySeatsLeft" INTEGER NOT NULL DEFAULT 120,
    "businessSeatsLeft" INTEGER NOT NULL DEFAULT 30,
    "firstClassSeatsLeft" INTEGER NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "flight_seats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flightId" TEXT NOT NULL,
    "seatClass" TEXT NOT NULL DEFAULT 'ECONOMY',
    "seatNumber" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "price" REAL NOT NULL,
    "bookedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "flight_seats_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "flight_seats_bookedBy_fkey" FOREIGN KEY ("bookedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trains" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainNumber" TEXT NOT NULL,
    "trainName" TEXT NOT NULL,
    "operator" TEXT NOT NULL DEFAULT 'Indian Railways',
    "origin" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "departureTime" DATETIME NOT NULL,
    "arrivalTime" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "distance" INTEGER,
    "daysOfWeek" TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
    "sleeperBasePrice" REAL,
    "sleeperCurrentPrice" REAL,
    "sleeperSeatsLeft" INTEGER DEFAULT 200,
    "ac3BasePrice" REAL,
    "ac3CurrentPrice" REAL,
    "ac3SeatsLeft" INTEGER DEFAULT 60,
    "ac2BasePrice" REAL,
    "ac2CurrentPrice" REAL,
    "ac2SeatsLeft" INTEGER DEFAULT 40,
    "ac1BasePrice" REAL,
    "ac1CurrentPrice" REAL,
    "ac1SeatsLeft" INTEGER DEFAULT 20,
    "ccBasePrice" REAL,
    "ccCurrentPrice" REAL,
    "ccSeatsLeft" INTEGER DEFAULT 70,
    "ecBasePrice" REAL,
    "ecCurrentPrice" REAL,
    "ecSeatsLeft" INTEGER DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "buses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "busNumber" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AC',
    "origin" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "departureTime" DATETIME NOT NULL,
    "arrivalTime" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalSeats" INTEGER NOT NULL DEFAULT 40,
    "availableSeats" INTEGER NOT NULL DEFAULT 40,
    "basePrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "boardingPoints" TEXT NOT NULL DEFAULT '[]',
    "droppingPoints" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingRef" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "hotelId" TEXT,
    "flightId" TEXT,
    "trainId" TEXT,
    "busId" TEXT,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "roomTypeId" TEXT,
    "roomCount" INTEGER DEFAULT 1,
    "seatNumbers" TEXT DEFAULT '[]',
    "seatClass" TEXT,
    "passengerDetails" TEXT DEFAULT '[]',
    "specialRequests" TEXT,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "baseAmount" REAL NOT NULL,
    "gstAmount" REAL NOT NULL DEFAULT 0,
    "convenienceFee" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "paidAt" DATETIME,
    "cancelledAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "trains" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" TEXT NOT NULL,
    "methodDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'DEMO_RAZORPAY',
    "refundAmount" REAL,
    "refundReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "refundedAt" DATETIME,
    CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "seatClass" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT,
    "flightId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "verifiedStay" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reviews_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "searchType" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "searchType" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wishlists_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_slug_key" ON "hotels"("slug");

-- CreateIndex
CREATE INDEX "hotels_city_idx" ON "hotels"("city");

-- CreateIndex
CREATE INDEX "hotels_country_idx" ON "hotels"("country");

-- CreateIndex
CREATE INDEX "hotels_starRating_idx" ON "hotels"("starRating");

-- CreateIndex
CREATE INDEX "hotels_basePrice_idx" ON "hotels"("basePrice");

-- CreateIndex
CREATE INDEX "room_types_hotelId_idx" ON "room_types"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "flights_flightNumber_key" ON "flights"("flightNumber");

-- CreateIndex
CREATE INDEX "flights_origin_destination_idx" ON "flights"("origin", "destination");

-- CreateIndex
CREATE INDEX "flights_departureTime_idx" ON "flights"("departureTime");

-- CreateIndex
CREATE INDEX "flights_airline_idx" ON "flights"("airline");

-- CreateIndex
CREATE INDEX "flight_seats_flightId_idx" ON "flight_seats"("flightId");

-- CreateIndex
CREATE UNIQUE INDEX "flight_seats_flightId_seatNumber_key" ON "flight_seats"("flightId", "seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trains_trainNumber_key" ON "trains"("trainNumber");

-- CreateIndex
CREATE INDEX "trains_origin_destination_idx" ON "trains"("origin", "destination");

-- CreateIndex
CREATE INDEX "trains_departureTime_idx" ON "trains"("departureTime");

-- CreateIndex
CREATE UNIQUE INDEX "buses_busNumber_key" ON "buses"("busNumber");

-- CreateIndex
CREATE INDEX "buses_origin_destination_idx" ON "buses"("origin", "destination");

-- CreateIndex
CREATE INDEX "buses_departureTime_idx" ON "buses"("departureTime");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingRef_key" ON "bookings"("bookingRef");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_bookingRef_idx" ON "bookings"("bookingRef");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "price_history_entityType_entityId_idx" ON "price_history"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "price_history_recordedAt_idx" ON "price_history"("recordedAt");

-- CreateIndex
CREATE INDEX "reviews_hotelId_idx" ON "reviews"("hotelId");

-- CreateIndex
CREATE INDEX "reviews_flightId_idx" ON "reviews"("flightId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "search_logs_searchType_idx" ON "search_logs"("searchType");

-- CreateIndex
CREATE INDEX "search_logs_createdAt_idx" ON "search_logs"("createdAt");

-- CreateIndex
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_userId_hotelId_key" ON "wishlists"("userId", "hotelId");
