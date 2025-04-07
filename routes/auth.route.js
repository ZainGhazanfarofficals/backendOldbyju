import express from "express";
import { login, register, generateOTP, regenerateOTP, verifyOTP, refreshToken, logout } from "../controllers/auth.controller.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["buyer", "seller"]
 *                 description: User role (buyer or seller)
 *     responses:
 *       201:
 *         description: User registered successfully, OTP verification required
 *       400:
 *         description: Invalid input
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/generate-otp:
 *   post:
 *     summary: Generate OTP for user verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Error generating OTP
 */
router.post("/generate-otp", generateOTP);

/**
 * @swagger
 * /api/auth/regenerate-otp:
 *   post:
 *     summary: Regenerate OTP for user verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP regenerated successfully
 *       400:
 *         description: Error regenerating OTP
 */
router.post("/regenerate-otp", regenerateOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP to complete user registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified, registration completed
 *       400:
 *         description: Invalid OTP or expired
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       403:
 *         description: Invalid refresh token
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logout);

export default router;
