import { Router } from 'express';
import {
  signUp,
  verifyOTP,
  resendOTP,
  signIn,
  forgotPassword,
  resetPassword,
  changePassword,
  signOut,
  me,
} from '../controllers/auth_controller';
import { authMiddleware } from '../middleware/middleware';
import { rateLimitMiddleware } from '../middleware/middleware'; // optional

const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/change-password', authMiddleware, changePassword);
router.post('/signout', authMiddleware, signOut);
router.get('/me', authMiddleware, me);

// Optional: Apply rate limiting to sensitive endpoints
router.post('/signin', rateLimitMiddleware(60, 5), signIn);
router.post('/forgot-password', rateLimitMiddleware(60, 3), forgotPassword);
router.post('/reset-password', rateLimitMiddleware(60, 3), resetPassword);

export default router;