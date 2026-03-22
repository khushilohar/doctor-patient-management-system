import Joi from "joi";

// 🔐 Common fields
const email = Joi.string().email().required();

const password = Joi.string()
  .min(6)
  .max(50)
  .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$"))
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one letter and one number",
  });

const otp = Joi.string().length(6).pattern(/^[0-9]+$/).required();

// =========================
// ✅ SIGN UP
// =========================
export const signUpSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email,
  password,
  phone: Joi.string().min(10).max(15).optional(),
  userType: Joi.string()
    .valid("superadmin", "admin", "user")
    .optional(), // optional → default handled in DB
});

// =========================
// ✅ SIGN IN
// =========================
export const signInSchema = Joi.object({
  email,
  password,
});

// =========================
// ✅ VERIFY OTP
// =========================
export const verifyOtpSchema = Joi.object({
  email,
  otp,
});

// =========================
// ✅ RESEND / RESET OTP
// =========================
export const resendOtpSchema = Joi.object({
  email,
});

// =========================
// ✅ FORGOT PASSWORD
// =========================
export const forgotPasswordSchema = Joi.object({
  email,
});

// =========================
// ✅ RESET PASSWORD (after OTP)
// =========================
export const resetPasswordSchema = Joi.object({
  email,
  otp,
  newPassword: password,
});

// =========================
// ✅ CHANGE PASSWORD (logged in)
// =========================
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: password,
});

// =========================
// ✅ LOGOUT (optional)
// =========================
export const signOutSchema = Joi.object({
  userId: Joi.number().required(),
});