import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastMessage: { type: String, default: "" }, // Stores the last sent message
  lastMessageAt: { type: Date, default: Date.now }, // Timestamp of last message
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
