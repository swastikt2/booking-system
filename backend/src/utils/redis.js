const Redis = require('ioredis');

let redis;
let isRedisAvailable = false;

// In-memory fallback store
const memoryStore = new Map();
const memoryTTL = new Map();

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️  Redis connection failed, using in-memory fallback');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true
  });

  redis.on('connect', () => {
    isRedisAvailable = true;
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    isRedisAvailable = false;
  });
} catch (err) {
  console.warn('⚠️  Redis not available, using memory fallback');
}

// Wrapper that falls back to memory if Redis unavailable
const cache = {
  async get(key) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.get(key);
      }
    } catch (e) {}
    // Memory fallback
    const item = memoryStore.get(key);
    if (!item) return null;
    const ttl = memoryTTL.get(key);
    if (ttl && Date.now() > ttl) {
      memoryStore.delete(key);
      memoryTTL.delete(key);
      return null;
    }
    return item;
  },

  async set(key, value, ...args) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.set(key, value, ...args);
      }
    } catch (e) {}
    memoryStore.set(key, value);
    if (args[0] === 'EX' && args[1]) {
      memoryTTL.set(key, Date.now() + args[1] * 1000);
    }
  },

  async del(key) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.del(key);
      }
    } catch (e) {}
    memoryStore.delete(key);
    memoryTTL.delete(key);
  },

  async incr(key) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.incr(key);
      }
    } catch (e) {}
    const val = parseInt(memoryStore.get(key) || '0') + 1;
    memoryStore.set(key, String(val));
    return val;
  },

  async expire(key, seconds) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.expire(key, seconds);
      }
    } catch (e) {}
    memoryTTL.set(key, Date.now() + seconds * 1000);
  },

  async keys(pattern) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.keys(pattern);
      }
    } catch (e) {}
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return [...memoryStore.keys()].filter(k => regex.test(k));
  },

  async ttl(key) {
    try {
      if (isRedisAvailable && redis) {
        return await redis.ttl(key);
      }
    } catch (e) {}
    const exp = memoryTTL.get(key);
    if (!exp) return -1;
    return Math.max(0, Math.floor((exp - Date.now()) / 1000));
  },

  ping() {
    if (isRedisAvailable && redis) {
      return redis.ping();
    }
    return Promise.resolve('PONG');
  },

  disconnect() {
    if (redis) {
      try { redis.disconnect(); } catch(e) {}
    }
  }
};

module.exports = { redis: cache, isRedisAvailable: () => isRedisAvailable };
