import Job from "../models/job.model.js";
import createError from "../utils/createError.js";
import { uploadToCloudinary } from "../utils/upload.js";

export const createJob = async (req, res, next) => {
  try {
    let attachments = [];
    if (req.files) {
      for (const file of req.files) {
        const uploadedFile = await uploadToCloudinary(file.path);
        attachments.push(uploadedFile.url);
      }
    }

    const { category, title, description, budget } = req.body;
    if (!category || !title || !description || !budget) {
      return next(createError(400, "Category, title, description, and budget are required."));
    }

    const newJob = new Job({
      buyerId: req.userId,
      title,
      description,
      budget,
      category, // ✅ Save category
      attachments,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    next(err);
  }
};


export const archiveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.buyerId.toString() !== req.userId) return next(createError(403, "Unauthorized"));
    
    job.status = "archived";
    await job.save();
    res.status(200).json({ message: "Job archived successfully" });
  } catch (err) {
    next(err);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const { category, minBudget, maxBudget } = req.query;

    const filter = { status: "open" };

    if (category) {
      filter.category = category;
    }

    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
};


export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.buyerId.toString() !== req.userId) return next(createError(403, "Unauthorized"));

    if (job.status !== "open") return next(createError(400, "Only open jobs can be deleted"));
    
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};