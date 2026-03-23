import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send OTP email to a user
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"Flip Health" <${process.env.SMTP_USERNAME}>`,
    to: email,
    subject: 'Your OTP for Flip Health',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification / Password Reset</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">Flip Health – Secure Healthcare Platform</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Re-throw or handle as needed – the controller will log the error but won't block registration
    throw new Error('Failed to send OTP email');
  }
};

// Optional: Generic email sender
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const mailOptions = {
    from: `"Flip Health" <${process.env.SMTP_USERNAME}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};