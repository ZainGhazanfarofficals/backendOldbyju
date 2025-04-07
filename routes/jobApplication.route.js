import express from "express";
import multer from "multer";
import { applyToJob, getJobApplications } from "../controllers/jobApplication.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage (use Cloudinary/S3 in production)

/**
 * @swagger
 * tags:
 *   name: Job Applications
 *   description: Managing job applications
 */

/**
 * @swagger
 * /api/job-applications:
 *   post:
 *     summary: Apply to a job with optional file attachments
 *     tags: [Job Applications]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job being applied to
 *                 example: "61f6a2c3b2d6d93f20c1e4a7"
 *               coverLetter:
 *                 type: string
 *                 description: The applicant's cover letter
 *                 example: "I am interested in this job because..."
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (resume, certificates, etc.)
 *     responses:
 *       201:
 *         description: Job application submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, upload.array("attachments", 5), applyToJob);

/**
 * @swagger
 * /api/job-applications/{jobId}:
 *   get:
 *     summary: Get all applications for a job
 *     tags: [Job Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to retrieve applications for
 *     responses:
 *       200:
 *         description: List of job applications retrieved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get("/:jobId", verifyToken, getJobApplications);

export default router;
