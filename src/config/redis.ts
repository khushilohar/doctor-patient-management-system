// src/config/redis.ts
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  lazyConnect: true, // connect on first command
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Helper: store OTP with expiration (in seconds)
export const storeOtp = async (email: string, otp: string, ttlSeconds: number) => {
  const key = `otp:${email}`;
  await redis.setex(key, ttlSeconds, otp);
};

// Helper: verify OTP (returns true if matches and deletes)
export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const key = `otp:${email}`;
  const stored = await redis.get(key);
  if (stored === otp) {
    await redis.del(key);
    return true;
  }
  return false;
};

// Helper: delete OTP (optional)
export const deleteOtp = async (email: string) => {
  await redis.del(`otp:${email}`);
};

// Rate limiting helper: returns true if limit exceeded
export const isRateLimited = async (key: string, windowSeconds: number, maxRequests: number): Promise<boolean> => {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current > maxRequests;
};

export default redis;