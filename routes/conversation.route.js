import express from "express";
import { createConversation, getUserConversations, getConversationMessages } from "../controllers/conversation.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: API for managing conversations
 */

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create or get an existing conversation
 *     tags: [Conversations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the user to start a conversation with
 *     responses:
 *       200:
 *         description: Conversation retrieved or created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, createConversation);

/**
 * @swagger
 * /api/conversations/user/{userId}:
 *   get:
 *     summary: Get all conversations of a user
 *     tags: [Conversations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose conversations should be retrieved
 *     responses:
 *       200:
 *         description: List of conversations retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 */
router.get("/user/:userId", verifyToken, getUserConversations);

/**
 * @swagger
 * /api/conversations/{conversationId}:
 *   get:
 *     summary: Get all messages in a conversation
 *     tags: [Conversations]
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
 */
router.get("/:conversationId", verifyToken, getConversationMessages);

export default router;
