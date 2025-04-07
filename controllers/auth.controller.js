import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import dotenv from "dotenv";
import createError from "../utils/createError.js";
import nodemailer from "nodemailer";

dotenv.config();

const usersOTP = {}; // Temporary store for OTPs (Use Redis in production)
const refreshTokens = {}; // Store refresh tokens in DB or Redis in production

// ✅ Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (not actual password)
  },
});

// ✅ Generate and send OTP via email
export const generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  usersOTP[email] = { otp, expiresAt: Date.now() + 300000 }; // OTP valid for 5 minutes

  // Send OTP via email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Verification",
    text: `Your OTP for verification is: ${otp}. This OTP is valid for 5 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP email:", error);
    } else {
      console.log("OTP email sent:", info.response);
    }
  });

  return otp;
};

// ✅ Regenerate OTP and send email
export const regenerateOTP = (req, res) => {
  const { email } = req.body;
  if (!usersOTP[email]) return res.status(400).json({ message: "No OTP generated yet" });

  const newOtp = generateOTP(email);
  res.status(200).json({ message: "OTP regenerated and sent via email", otp: newOtp });
};

// ✅ Verify OTP and update user status
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!usersOTP[email]) return next(createError(400, "OTP not found or expired"));
    if (usersOTP[email].otp !== parseInt(otp)) return next(createError(400, "Invalid OTP"));

    await User.findOneAndUpdate({ email }, { isVerified: true });
    delete usersOTP[email]; // OTP used, remove it

    res.status(200).json({ message: "OTP verified, registration confirmed" });
  } catch (err) {
    next(err);
  }
};

// ✅ Register User and Send OTP
export const register = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser && !existingUser.isVerified) {
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      await User.findOneAndUpdate(
        { email: req.body.email },
        { username: req.body.username, password: hashedPassword, role: req.body.role }
      );
      const otp = generateOTP(req.body.email);
      return res.status(200).json({ message: "User already registered but not verified. OTP re-sent", otp });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({ ...req.body, password: hashedPassword, isVerified: false });
    await newUser.save();
    
    const otp = generateOTP(req.body.email);
    res.status(201).json({ message: "User registered successfully. OTP sent to email", otp });
  } catch (err) {
    next(err);
  }
};

// ✅ Login with Email Verification Check
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found"));

    if (!user.isVerified) {
      const otp = generateOTP(user.email);
      return next(createError(403, "User not verified. New OTP sent to email", { otp }));
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return next(createError(401, "Incorrect password"));

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens[user._id] = refreshToken;

    res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: "Login successful", accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

// ✅ Refresh Token
export const refreshToken = (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next(createError(401, "No refresh token found"));

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, async (err, payload) => {
    if (err || refreshTokens[payload.id] !== refreshToken) return next(createError(403, "Invalid refresh token"));

    const user = await User.findById(payload.id);
    if (!user) return next(createError(404, "User not found"));

    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.status(200).json({ accessToken: newAccessToken });
  });
};

// ✅ Logout
export const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};
