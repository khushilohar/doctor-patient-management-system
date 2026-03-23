import { z } from 'zod';

// User type enum (matches users table)
const userTypeEnum = z.enum(['super_admin', 'admin', 'patient', 'doctor', 'customer', 'shop_owner']);

// Common email validation
const emailSchema = z.string().email('Invalid email format').max(255);

// Password: at least 8 characters, at least one letter and one number
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(255)
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number');

// Sign Up
export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().max(20).optional(),
  user_type: userTypeEnum.nullable().optional(), // user can choose during sign-up; if omitted, defaults to 'patient' or 'customer' in controller
});

// Verify OTP (after sign-up or password reset)
export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

// Request OTP for password reset (send reset OTP)
export const resetOtpSchema = z.object({
  email: emailSchema,
});

// Forgot Password – typically same as resetOtp, but could have extra steps
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Change Password (after login)
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});


// Sign In
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const userActionSchema = z.object({
  resource: z.string().min(1),
  action: z.string().min(1),
});

export const userPolicySchema = z.object({
  resource: z.string().min(1),
  actions: z.array(z.string().min(1)),
});

// Type exports for TypeScript
export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetOtpInput = z.infer<typeof resetOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
export type UserPolicyInput = z.infer<typeof userPolicySchema>;