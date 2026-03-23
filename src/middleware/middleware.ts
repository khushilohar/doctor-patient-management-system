// src/middleware/middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/users_model';
import dotenv from 'dotenv';
import { isRateLimited } from '../config/redis';
import redis from '../config/redis';

dotenv.config();
const secret_key = process.env.SECRET_KEY as string;

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        userType: string;
        policies: Record<string, boolean>;
      };
    }
  }
}

// Authentication Middleware: verifies JWT, checks blacklist, and attaches user info
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Check blacklist first (fast fail)
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted === 'true') {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, secret_key) as {
      userId: number;
      userType: string;
      policies: Record<string, boolean>;
      iat: number;
      exp: number;
    };

    // 3. Verify user still exists and is not deleted
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'is_deleted'],
    });
    if (!user || user.is_deleted) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = {
      userId: decoded.userId,
      userType: decoded.userType,
      policies: decoded.policies,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// RBAC Middleware: checks if user has permission for resource and action
export const rbacMiddleware = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super admin bypass (role code 'super_admin')
    if (req.user.userType === 'super_admin') {
      return next();
    }

    const permissionKey = `${resource}:${action}`;
    const hasPermission = req.user.policies[permissionKey] === true;

    if (!hasPermission) {
      return res.status(403).json({
        message: `Forbidden: missing permission ${permissionKey}`,
      });
    }

    next();
  };
};

// Ownership Middleware: checks if the authenticated user owns the resource they're trying to access
export const ownershipMiddleware = (
  getResourceUserId: (req: Request) => Promise<number | null> | number | null
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const resourceOwnerId = await getResourceUserId(req);
      if (resourceOwnerId === null) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      if (req.user.userId !== resourceOwnerId) {
        return res.status(403).json({ message: 'You do not own this resource' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Rate Limiting Middleware using Redis: limits requests based on IP and endpoint
export const rateLimitMiddleware = (windowSeconds: number, maxRequests: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Use IP + endpoint as key, or user ID if authenticated
    const key = `rate:${req.ip}:${req.path}`;
    const limited = await isRateLimited(key, windowSeconds, maxRequests);
    if (limited) {
      return res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
    next();
  };
};

// Export the AuthRequest type for convenience
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    userType: string;
    policies: Record<string, boolean>;
  };
}