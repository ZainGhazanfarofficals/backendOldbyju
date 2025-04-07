import express from "express";
import { submitReview, getReviewsForUser } from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: User review management based on completed orders
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a review for an order
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order being reviewed
 *                 example: "61f6a2c3b2d6d93f20c1e4a7"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating for the user
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Feedback about the experience
 *                 example: "Great experience working on this project!"
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Invalid request data or already reviewed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Unauthorized to review this order
 */
router.post("/", verifyToken, submitReview);

/**
 * @swagger
 * /api/reviews/{userId}:
 *   get:
 *     summary: Get all reviews for a user
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch reviews for
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get("/:userId", verifyToken, getReviewsForUser);

export default router;
