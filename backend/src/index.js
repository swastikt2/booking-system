require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const flightRoutes = require('./routes/flights');
const hotelRoutes = require('./routes/hotels');
const trainRoutes = require('./routes/trains');
const busRoutes = require('./routes/buses');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Import services
const { PriceFluctuationAgent } = require('./agents/PriceFluctuationAgent');
const { setupWebSocket } = require('./websocket/socketManager');
const { redis } = require('./utils/redis');
const prisma = require('./utils/prisma');

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// ─── Middleware ───────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API REQUEST] ${req.method} ${req.path}`, {
      query: req.query,
      body: req.method === 'POST' ? { ...req.body, password: req.body.password ? '***' : undefined } : undefined
    });
  }
  next();
});
app.use(rateLimiter);

// ─── API Documentation ──────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TravelNest API Documentation'
}));

// ─── Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TravelNest API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demo: true
  });
});

// ─── Error Handler ───────────────────────────────
app.use(errorHandler);

// ─── WebSocket Setup ─────────────────────────────
setupWebSocket(io);

// ─── Start Server ────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test Redis connection
    try {
      await redis.ping();
      console.log('✅ Redis connected');
    } catch (redisErr) {
      console.warn('⚠️  Redis not available, using in-memory fallback');
    }

    // Seed data on first start
    if (process.env.SEED_ON_START === 'true') {
      try {
        const userCount = await prisma.user.count();
        if (userCount === 0) {
          console.log('🌱 Seeding database...');
          const { seedDatabase } = require('../prisma/seed');
          await seedDatabase();
          console.log('✅ Database seeded');
        }
      } catch (seedErr) {
        console.warn('⚠️  Seed skipped:', seedErr.message);
      }
    }

    // Start price fluctuation engine
    if (process.env.PRICE_FLUCTUATION_ENABLED === 'true') {
      const agent = new PriceFluctuationAgent(io);
      agent.start();
      console.log('📈 Price fluctuation engine started');
    }

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║   🏨 Mahasor Journey API Server         ║
║   Port: ${PORT}                            ║
║   Mode: ${process.env.NODE_ENV || 'development'}                  ║
║   Docs: http://localhost:${PORT}/api/docs    ║
║   Status: DEMO MODE                     ║
║                                          ║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  redis.disconnect();
  server.close();
  process.exit(0);
});

module.exports = { app, server, io };
