import { z } from 'zod';

// User type enum (matches migration)
const userTypeEnum = z.enum(['super_admin', 'admin', 'patient', 'doctor', 'customer', 'shop_owner']).nullable();

// Base schema for common fields
const userBase = {
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(255),
  phone: z.string().max(20).optional(),
  status: z.boolean().optional().default(true),
  userType: userTypeEnum.optional().default(null),
  is_verified: z.boolean().optional().default(false),
  is_deleted: z.boolean().optional().default(false),
};

// Create user – all required fields
export const createUserSchema = z.object({
  name: userBase.name,
  email: userBase.email,
  password: userBase.password,
  phone: userBase.phone,
  status: userBase.status,
  userType: userBase.userType,
  is_verified: userBase.is_verified,
  is_deleted: userBase.is_deleted,
});

// Update user – all fields optional
export const updateUserSchema = z.object({
  name: userBase.name.optional(),
  email: userBase.email.optional(),
  password: userBase.password.optional(),
  phone: userBase.phone,
  status: userBase.status,
  userType: userBase.userType,
  is_verified: userBase.is_verified,
  is_deleted: userBase.is_deleted,
}).partial(); // makes all fields optional

// Validate route parameters (e.g., /users/:id)
export const userParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// Infer TypeScript types
export type UserCreateInput = z.infer<typeof createUserSchema>;
export type UserUpdateInput = z.infer<typeof updateUserSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;