import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/users_model";
import nodemailer from "nodemailer";

// ==========================
// 📧 MAIL CONFIG
// ==========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==========================
// 🔢 TEMP OTP STORE (Use DB/Redis in prod)
// ==========================
const otpStore: Record<string, { otp: string; expires: number }> = {};

// ==========================
// 🧾 SIGN UP
// ==========================
export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, userType } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      userType: userType || "user",
    });

    // generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      to: email,
      subject: "Verify OTP",
      text: `Your OTP is ${otp}`,
    });

    return res.json({
      message: "User created. OTP sent to email",
      userId: user.id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Signup failed" });
  }
};

// ==========================
// 🔐 VERIFY OTP
// ==========================
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.expires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await User.update(
      { is_verified: true },
      { where: { email } }
    );

    delete otpStore[email];

    return res.json({ message: "Account verified successfully" });
  } catch {
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

// ==========================
// 🔁 RESEND OTP
// ==========================
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      to: email,
      subject: "Resend OTP",
      text: `Your OTP is ${otp}`,
    });

    return res.json({ message: "OTP resent successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// ==========================
// 🔑 SIGN IN
// ==========================
export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Verify your account first" });
    }

    // ⚡ TEMP policies (replace with DB RBAC later)
    const policies = ["user:create", "user:read"];

    const token = jwt.sign(
      {
        userId: user.id,
        userType: user.userType,
        policies,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
};

// ==========================
// 🔐 FORGOT PASSWORD
// ==========================
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}`,
    });

    return res.json({ message: "OTP sent for password reset" });
  } catch {
    return res.status(500).json({ message: "Failed" });
  }
};

// ==========================
// 🔄 RESET PASSWORD
// ==========================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];

    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashed },
      { where: { email } }
    );

    delete otpStore[email];

    return res.json({ message: "Password reset successful" });
  } catch {
    return res.status(500).json({ message: "Reset failed" });
  }
};

// ==========================
// 🔁 CHANGE PASSWORD
// ==========================
export const changePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashed });

    return res.json({ message: "Password changed successfully" });
  } catch {
    return res.status(500).json({ message: "Change password failed" });
  }
};

// ==========================
// 🚪 SIGN OUT
// ==========================
export const signOut = async (_req: Request, res: Response) => {
  // stateless JWT → handled client side
  return res.json({ message: "Logged out successfully" });
};