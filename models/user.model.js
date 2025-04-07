import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // Cloudinary image URL
  role: { type: String, enum: ["student", "teacher"], required: true },
  
  isVerified: { type: Boolean, default: false },

  // ✅ Order and payment tracking
  ordersCompleted: { type: Number, default: 0 }, // Total orders completed (as seller)
  paymentsMade: { type: Number, default: 0 }, // Total amount paid (as buyer)
  paymentsReceived: { type: Number, default: 0 }, // Total amount received (as seller)
  earnedBalance: { type: Number, default: 0 }, // ✅ Amount available for payout
  averageRating: { type: Number, default: 0 }, // ✅ Average rating field

  // ✅ Seller-specific info
  education: { type: String }, 
  jobExperience: { type: String },
  personalProjects: [{ type: String }],
  keywords: [{ type: String }], // ✅ Added keyword array

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
