import express from "express";
import { createOrder, updateOrderStatus, getOrders, completeOrder } from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job being ordered
 *                 example: "61f6a2c3b2d6d93f20c1e4a7"
 *               sellerId:
 *                 type: string
 *                 description: ID of the seller
 *                 example: "67c0eccfc2d9c02208aa0fb1"
 *               price:
 *                 type: number
 *                 description: Order amount in USD or EUR
 *                 example: 100.50
 *               currency:
 *                 type: string
 *                 enum: ["USD", "EUR"]
 *                 description: Currency of the order (USD or EUR)
 *                 example: "USD"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input or missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, createOrder);

/**
 * @swagger
 * /api/orders/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
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
 *                 description: ID of the order
 *               status:
 *                 type: string
 *                 enum: ["pending", "in_progress", "completed", "cancelled"]
 *                 description: New status of the order
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.put("/status", verifyToken, updateOrderStatus);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for a user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, getOrders);

/**
 * @swagger
 * /api/orders/complete:
 *   put:
 *     summary: Mark an order as completed
 *     tags: [Orders]
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
 *                 description: ID of the order to complete
 *     responses:
 *       200:
 *         description: Order marked as completed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.put("/complete", verifyToken, completeOrder);

export default router;
