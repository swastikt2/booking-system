const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mahasor Journey API',
      version: '1.0.0',
      description: `
# Mahasor Journey API Documentation

A comprehensive travel booking platform API supporting Hotels, Flights, Trains, and Buses.

**⚠️ DEMO MODE**: All bookings and payments are simulated. No real transactions occur.

## Features
- 🏨 Hotel search & booking with real-time pricing
- ✈️ Flight search with seat selection
- 🚂 Train booking (IRCTC-style)
- 🚌 Bus booking with operator filters
- 💰 Real-time price fluctuation engine
- 🔐 JWT authentication
- 📊 Admin dashboard

## Authentication
Use Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Demo Accounts
- User: demo@travelnest.com / Demo@123
- Admin: admin@travelnest.com / Admin@123
      `,
      contact: {
        name: 'Mahasor Journey Support',
        email: 'support@mahasorjourney.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
