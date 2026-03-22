import { Router } from "express";
import {
  signUp,
  verifyOtp,
  resendOtp,
  signIn,
  forgotPassword,
  resetPassword,
  changePassword,
  signOut,
} from "../controllers/auth_controller";

import { userAction } from "../middleware/middleware";

const router = Router();

// ==========================
// 🔐 AUTH ROUTES
// ==========================
router.post("/signup", signUp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/change-password", userAction, changePassword);
router.post("/signout", userAction, signOut);

export default router;