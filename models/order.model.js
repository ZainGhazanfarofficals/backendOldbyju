import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Job' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  paymentLinkId: { type: String, required: true }, // Store Razorpay payment link ID
  paymentId: { type: String }, // Store Razorpay payment ID after payment completion
  
  orderStatus: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  }, // Tracks order progress

  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  }, // Tracks payment progress

}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);