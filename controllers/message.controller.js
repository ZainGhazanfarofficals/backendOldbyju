import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import createError from "../utils/createError.js";

// ✅ Send a message and notify receiver
export const sendMessage = async (io, req, res, next) => {
  try {
    console.log("sendMessage function called"); // ✅ Debug log

    const { conversationId, receiverId, message } = req.body;
    if (!conversationId || !receiverId || !message) {
      console.log("Missing required fields");
      return next(createError(400, "Missing required fields"));
    }

    console.log("Saving message to DB...");
    const newMessage = new Message({
      conversationId,
      senderId: req.userId,
      receiverId,
      message,
      status: "sent",
    });

    await newMessage.save();
    console.log("Message saved successfully");

    console.log("Updating conversation with last message...");
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageAt: Date.now(),
    });

    console.log("Emitting message via Socket.io...");
    io.to(receiverId).emit("newMessage", newMessage);
    console.log("Message emitted successfully");

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error in sendMessage:", err);
    next(err);
  }
};



// ✅ Get all messages for a conversation
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return next(createError(400, "Conversation ID is required"));

    const messages = await Message.find({ conversationId }).sort("createdAt");
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};
