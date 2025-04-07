import mongoose from "mongoose";
const { Schema } = mongoose;

const JobApplicationSchema = new Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: { type: String, required: true },
  attachments: [{ type: String }], // Array of Cloudinary file URLs
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("JobApplication", JobApplicationSchema);
