import express from "express";
import { createJob, archiveJob, getJobs, deleteJob } from "../controllers/job.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job posting and management
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job post
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, createJob);

/**
 * @swagger
 * /api/jobs/{id}/archive:
 *   put:
 *     summary: Archive a job post
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to archive
 *     responses:
 *       200:
 *         description: Job archived successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/archive", verifyToken, archiveJob);

/**
 * @swagger
 * /api/jobs/{id}/delete:
 *   put:
 *     summary: Delete a job post
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/delete", verifyToken, deleteJob);
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all job posts with optional filters
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter jobs by category
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *         description: Minimum budget to filter jobs
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *         description: Maximum budget to filter jobs
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, getJobs);


export default router;
