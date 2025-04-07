import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import createError from "../utils/createError.js";

// ✅ Create a new conversation or get an existing one
export const createConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    let conversation = await Conversation.findOne({
      $or: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }]
    });

    if (!conversation) {
      conversation = new Conversation({ senderId, receiverId });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    next(err);
  }
};

// ✅ Get all conversations of a user (student or teacher)
export const getUserConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) return next(createError(400, "User ID is required"));

    const conversations = await Conversation.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate("senderId receiverId", "username email");

    res.status(200).json(conversations);
  } catch (err) {
    next(err);
  }
};

// ✅ Get conversation messages
export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return next(createError(400, "Conversation ID is required"));

    const messages = await Message.find({ conversationId }).sort("createdAt");
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};
