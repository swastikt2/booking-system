const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

class AuthService {
  async register({ email, password, fullName, phone }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        loyaltyPoints: 100 // Welcome bonus
      },
      select: {
        id: true, email: true, fullName: true, phone: true,
        role: true, tier: true, loyaltyPoints: true, createdAt: true
      }
    });

    const tokens = this.generateTokens(user.id);
    return { user, ...tokens };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ Login failed: User not found for email ${email}`);
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.error(`❌ Login failed: Invalid password for email ${email}`);
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const tokens = this.generateTokens(user.id);
    return {
      user: {
        id: user.id, email: user.email, fullName: user.fullName,
        phone: user.phone, role: user.role, tier: user.tier,
        loyaltyPoints: user.loyaltyPoints, avatar: user.avatar
      },
      ...tokens
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new Error('User not found');

      const tokens = this.generateTokens(user.id);
      return tokens;
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }
  }

  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async getProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, fullName: true, phone: true,
        avatar: true, nationality: true, dateOfBirth: true,
        passportNumber: true, role: true, tier: true,
        loyaltyPoints: true, travelCredits: true, createdAt: true
      }
    });
  }

  async updateProfile(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        nationality: data.nationality,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        passportNumber: data.passportNumber,
        avatar: data.avatar
      },
      select: {
        id: true, email: true, fullName: true, phone: true,
        avatar: true, nationality: true, dateOfBirth: true,
        role: true, tier: true, loyaltyPoints: true
      }
    });
  }
}

module.exports = new AuthService();
