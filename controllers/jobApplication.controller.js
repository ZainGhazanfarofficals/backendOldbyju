import JobApplication from "../models/jobApplication.model.js";
import { uploadToCloudinary } from "../utils/upload.js";

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;
    let attachments = [];
    
    if (req.files) {
      for (const file of req.files) {
        const uploadedFile = await uploadToCloudinary(file.path);
        attachments.push(uploadedFile.url);
      }
    }
    
    const newApplication = new JobApplication({
      jobId,
      sellerId: req.userId,
      coverLetter,
      attachments,
    });
    
    const savedApplication = await newApplication.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    next(err);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applications = await JobApplication.find({ jobId }).populate("sellerId", "username email");
    res.status(200).json(applications);
  } catch (err) {
    next(err);
  }
};
