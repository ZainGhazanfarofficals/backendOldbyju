import mongoose from "mongoose";
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher"], required: true },
}, { timestamps: true });

export default mongoose.model("Review", ReviewSchema);
