import express from "express";
import { updateUserProfile, getUserProfile, getUserStats,transferPayout, exploreTeachers, contactUs,  reportIssue } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", verifyToken, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: User profile picture (image upload)
 *               education:
 *                 type: string
 *                 description: User's educational background
 *               jobExperience:
 *                 type: string
 *                 description: User's job experience
 *               personalProjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of personal projects
 *               keywords:
 *                 type: string
 *                 description: Comma-separated keywords for search (e.g., "math, physics, coding")
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", verifyToken, upload.single("profilePicture"), updateUserProfile);


/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user stats
 *     tags: [Users]
 *     description: Retrieve the number of completed orders and available payout balance for the logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedOrders:
 *                   type: number
 *                   example: 5
 *                 availablePayout:
 *                   type: number
 *                   example: 250.00
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/stats", verifyToken, getUserStats);

/**
 * @swagger
 * /api/users/transfer-payout:
 *   post:
 *     summary: Transfer seller's earnings to their bank account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to transfer
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR]
 *                 default: USD
 *               recipientId:
 *                 type: string
 *                 description: Razorpay recipient ID
 *     responses:
 *       200:
 *         description: Payout transferred successfully
 *       400:
 *         description: Invalid request or insufficient balance
 *       500:
 *         description: Payout transfer failed
 */
router.post("/transfer-payout", verifyToken, transferPayout);

/**
 * @swagger
 * /api/users/explore-teachers:
 *   get:
 *     summary: Publicly explore teachers with optional keyword and minimum rating filters
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search in the teacher's keywords field
 *       - in: query
 *         name: minimumRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum average rating to filter teachers
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully
 *       400:
 *         description: Invalid request
 */
router.get("/explore-teachers", exploreTeachers);


/**
 * @swagger
 * /api/users/contact-us:
 *   post:
 *     summary: Contact us form (public)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/contact-us", contactUs);

/**
 * @swagger
 * /api/users/report-issue:
 *   post:
 *     summary: Report an issue (authenticated)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issue:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue reported successfully
 *       400:
 *         description: Issue description is required
 *       401:
 *         description: Unauthorized
 */
router.post("/report-issue", verifyToken, reportIssue);


export default router;