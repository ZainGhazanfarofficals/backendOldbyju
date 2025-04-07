import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyToken } from "../middleware/jwt.js";

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: API for sending and retrieving messages using Socket.io
 */

/**
 * @swagger
 * /api/messages/socket:
 *   post:
 *     summary: Send a new message via Socket.io
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     description: "Sends a new message via Socket.io and updates the conversation in the database."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation
 *               receiverId:
 *                 type: string
 *                 description: ID of the receiver
 *               message:
 *                 type: string
 *                 description: The message content
 *     responses:
 *       200:
 *         description: Message sent successfully via WebSocket
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get all messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation to retrieve messages for
 *     responses:
 *       200:
 *         description: List of messages retrieved successfully
 *       400:
 *         description: Invalid conversation ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export default function messageRoutes(io) {
  const router = express.Router();

  router.post("/socket", verifyToken, (req, res, next) => sendMessage(io, req, res, next));
  router.get("/:conversationId", verifyToken, getMessages);

  return router;
}
