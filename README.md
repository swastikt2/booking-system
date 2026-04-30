# TravelNest — Booking.com Clone 🏨✈️🚂🚌

A full-stack travel booking platform built for portfolio purposes. All bookings and payments are **DEMO/SIMULATION** only — no real transactions occur.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express |
| Database | PostgreSQL (Prisma ORM) |
| Cache | Redis |
| Real-time | Socket.IO |
| Auth | JWT (Access + Refresh tokens) |
| Docs | Swagger/OpenAPI |

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional, has in-memory fallback)

### 1. Clone & Install
```bash
git clone <repo-url>
cd travelnest

# Backend
cd backend
cp .env.example .env  # or use existing .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# Frontend
cd ../frontend
npm install
```

### 2. Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. Docker (Recommended)
```bash
docker-compose up --build
```

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| User | demo@travelnest.com | Demo@123 |
| Admin | admin@travelnest.com | Admin@123 |

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Search tabs for Flights/Hotels/Trains/Buses |
| Flight Search | `/search/flights` | Results with real-time prices |
| Hotel Search | `/search/hotels` | Results with availability |
| Train Search | `/search/trains` | IRCTC-style results |
| Bus Search | `/search/buses` | RedBus-style results |
| Hotel Detail | `/hotel/[id]` | Room selection + reviews |
| Flight Detail | `/flight/[id]` | Seat map + booking |
| Checkout | `/checkout` | Multi-step with countdown |
| Payment | `/payment` | Demo payment simulation |
| My Bookings | `/my-bookings` | Booking history |
| Admin | `/admin` | Dashboard with live stats |
| API Docs | `localhost:5000/api/docs` | Swagger documentation |

## 🏗️ Architecture

```
travelnest/
├── backend/
│   ├── src/
│   │   ├── agents/          # Price fluctuation engine
│   │   ├── services/        # Business logic
│   │   ├── routes/          # REST API
│   │   ├── middleware/      # Auth, rate limiting
│   │   ├── websocket/       # Socket.IO
│   │   └── utils/           # Prisma, Redis, Swagger
│   └── prisma/              # Schema + Seed
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── lib/                 # API client, Auth, Utils
│   └── components/
└── docker-compose.yml
```

## 📈 Features

- ✅ Real-time price fluctuation (cron-based)
- ✅ 500+ flights, 200+ hotels, 100+ trains, 150+ buses
- ✅ Interactive flight seat map
- ✅ 15-minute booking hold with countdown
- ✅ Demo payment with realistic success/failure rates
- ✅ JWT auth with token refresh
- ✅ Admin dashboard
- ✅ Loyalty points system
- ✅ Price trend tracking
- ✅ WebSocket real-time updates

## ⚠️ Disclaimer

This is a **DEMO PROJECT** for portfolio purposes only. No real bookings, payments, or reservations are made.
# booking-system
