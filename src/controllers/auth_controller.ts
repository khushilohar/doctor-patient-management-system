import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";
// import { Op } from 'sequelize';
import User from '../models/users_model';
import Role from '../models/roles_model';
import ResourceAction from '../models/resource_actions_model';
// import PermissionRole from '../models/permission_roles_model';
import { AuthRequest } from '../middleware/middleware';
import '../schemas/actions_schema';
import {
  signUpSchema,
  verifyOtpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../schemas/auth_schema';
import {
  createUser,
  getUserByEmail,
  updateUser,
} from '../CRUD/users_crud';
import { assignRolesToUser } from '../CRUD/user_roles_crud';
import { storeOtp, verifyOtp, deleteOtp } from '../config/redis';
import { sendOtpEmail } from '../utils/email';
import redis from '../config/redis';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined");
}
const JWT_SECRET: string = process.env.SECRET_KEY;
const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (
  process.env.ACCESS_TOKEN_EXPIRE_MINUTES
    ? `${Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES)}m`
    : "30m"
);

// Helper: Build policies object from user roles
async function buildUserPolicies(userId: number): Promise<Record<string, boolean>> {
  // Find all roles assigned to the user
  const userWithRoles = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        through: { attributes: [] },
        include: [
          {
            model: ResourceAction,
            through: { attributes: [] },
            include: ['Resource', 'Action'],
          },
        ],
      },
    ],
  }) as User & { Roles: (Role & { ResourceActions: (ResourceAction & { Resource: any; Action: any })[] })[] } | null;

  if (!userWithRoles) return {};

  const policies: Record<string, boolean> = {};

  for (const role of userWithRoles.Roles || []) {
    for (const ra of role.ResourceActions || []) {
      const resourceCode = (ra as any).Resource?.code;
      const actionCode = (ra as any).Action?.code;
      if (resourceCode && actionCode) {
        policies[`${resourceCode}:${actionCode}`] = true;
      }
    }
  }

  return policies;
}

// Helper: Generate JWT token
function generateToken(
  userId: number,
  userType: string,
  policies: Record<string, boolean>
): string {
  return jwt.sign(
    { userId, userType, policies },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 1. Sign Up
export const signUp = async (req: Request, res: Response) => {
  try {
    const validatedData = signUpSchema.parse(req.body);
    const { name, email, password, phone, user_type } = validatedData;

    // Check if user already exists
    const existingUser = await getUserByEmail(email, false);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Default user_type if not provided
    const userType = user_type || 'patient';

    // Create user (password will be hashed in createUser)
    const user = await createUser({
      name,
      email,
      password,
      phone,
      status: true,
      userType,
      is_verified: false,
      is_deleted: false,
    });

    // Assign default role based on user_type
    let defaultRoleCode = userType; // e.g., 'patient', 'doctor', etc.
    // For 'customer' role, code is 'customer' (same as user_type)
    // For 'shop_owner', code is 'shop_owner'
    // For admin/super_admin, they would be created by admin, not via signup.
    // If role doesn't exist, we could create it or fallback; but we assume roles are seeded.
    const role = await Role.findOne({ where: { code: defaultRoleCode } });
    if (role) {
      await assignRolesToUser(user.id, [role.id]);
    }

    // Generate OTP and store in Redis (expire in 10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = Number(process.env.OTP_EXPIRE_MINUTES) * 60 || 600;
    await storeOtp(email, otp, ttlSeconds);

    // Send OTP email (async, don't await to avoid delaying response)
    sendOtpEmail(email, otp).catch(err => console.error('Failed to send OTP email:', err));

    return res.status(201).json({
      message: 'User created. Please verify your email with the OTP sent.',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('SignUp error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 2. Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const validatedData = verifyOtpSchema.parse(req.body);
    const { email, otp } = validatedData;

    // Verify OTP from Redis
    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user to verified
    const user = await getUserByEmail(email, false);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await updateUser(user.id, { is_verified: true });

    // Optional: automatically log in user after verification
    // Generate JWT token
    const policies = await buildUserPolicies(user.id);
    const token = generateToken(user.id, user.userType || 'patient', policies);

    return res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 3. Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await getUserByEmail(email, false);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.is_verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = Number(process.env.OTP_EXPIRE_MINUTES) * 60 || 600;
    await storeOtp(email, otp, ttlSeconds);

    // Send OTP email (async)
    sendOtpEmail(email, otp).catch(err => console.error('Failed to send OTP email:', err));

    return res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 4. Sign In
export const signIn = async (req: Request, res: Response) => {
  try {
    const validatedData = signInSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await getUserByEmail(email, true); // include roles
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.is_deleted) {
      return res.status(401).json({ message: 'Account disabled' });
    }
    if (!user.is_verified) {
      return res.status(401).json({ message: 'Email not verified. Please verify your email.' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Build policies from user's roles
    const policies = await buildUserPolicies(user.id);

    // Generate JWT
    const token = generateToken(user.id, user.userType || 'patient', policies);

    return res.status(200).json({
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('SignIn error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 5. Forgot Password (send OTP)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    const user = await getUserByEmail(email, false);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ message: 'If your email is registered, you will receive an OTP.' });
    }

    // Generate OTP and store in Redis
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = Number(process.env.OTP_EXPIRE_MINUTES) * 60 || 600;
    await storeOtp(email, otp, ttlSeconds);

    // Send OTP email
    sendOtpEmail(email, otp).catch(err => console.error('Failed to send OTP email:', err));

    return res.status(200).json({ message: 'If your email is registered, you will receive an OTP.' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 6. Reset Password (using OTP)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { email, otp, newPassword } = validatedData;

    // Verify OTP
    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await getUserByEmail(email, false);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await updateUser(user.id, { password: hashedPassword });

    // Optionally delete OTP (already deleted in verifyOtp)
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 7. Change Password (authenticated)
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const { oldPassword, newPassword } = validatedData;

    const userId = req.user!.userId;
    const userById = await User.findByPk(userId);
    if (!userById) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, userById.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await updateUser(userId, { password: hashedPassword });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 8. Sign Out (blacklist token)
export const signOut = async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    // Decode token to get expiry (we need to blacklist for remaining time)
    const decoded = jwt.decode(token) as { exp: number } | null;
    if (decoded && decoded.exp) {
      const expiry = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      const ttl = expiry - now;
      if (ttl > 0) {
        await redis.setex(`blacklist:${token}`, ttl, 'true');
      } else {
        // Already expired, no need to blacklist
      }
    } else {
      // If cannot decode, set a short expiry (e.g., 5 minutes)
      await redis.setex(`blacklist:${token}`, 300, 'true');
    }

    return res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('SignOut error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 9. Get Current User Profile
export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'userType', 'status', 'is_verified'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};