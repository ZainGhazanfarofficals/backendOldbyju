import mongoose from "mongoose";
const { Schema } = mongoose;

const JobSchema = new Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  category: { type: String, required: true }, // ✅ Added category field
  attachments: [{ type: String }],
  status: { type: String, enum: ["open", "archived", "deleted", "hired"], default: "open" },
}, { timestamps: true });

export default mongoose.model("Job", JobSchema);
