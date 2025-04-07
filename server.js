// Adding Swagger API Documentation for Backend
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import Order from "./models/order.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";
import { verifyTokenSocket } from "./middleware/jwt.js";
import userRoute from "./routes/user.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import jobRoute from "./routes/job.route.js";
import jobApplicationRoute from "./routes/jobApplication.route.js";
import { errorHandler } from "./middleware/jwt.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN, credentials: true },
});

mongoose.set("strictQuery", true);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};

app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

// Swagger Documentation Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend API Documentation",
      version: "1.0.0",
      description: "API Documentation for testing backend endpoints in real time",
    },
    servers: [{ url: "http://localhost:8800" }],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoutes(io));
app.use("/api/reviews", reviewRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/job-applications", jobApplicationRoute);


// Webhook to listen for Razorpay events
app.post('/api/webhook/razorpay', express.json({ verify: (req, res, buf) => req.rawBody = buf }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Set this in your .env
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto.createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === "payment_link.paid") {
      const paymentLinkId = payload.payment_link.entity.id;
      const paymentId = payload.payment.entity.id;

      const order = await Order.findOne({ paymentLinkId });

      if (!order) {
        return res.status(404).json({ message: "Order not found for this payment link" });
      }

      order.paymentId = paymentId;
      order.paymentStatus = "paid";
      await order.save();

      console.log("✅ Payment successful. Order updated:", order._id);

      return res.status(200).json({ message: "Payment processed and order updated." });
    }

    res.status(200).json({ message: "Event ignored" });
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    res.status(500).json({ message: "Server error processing webhook" });
  }
});


// WebSocket Setup with Authentication
const activeUsers = new Map();

io.use(verifyTokenSocket);
io.on("connection", (socket) => {
  console.log("User connected: ", socket.userId);
  activeUsers.set(socket.userId, socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("send_message", async ({ conversationId, receiverId, message }) => {
    if (!conversationId || !receiverId || !message) return;
    const newMessage = new Message({
      conversationId,
      senderId: socket.userId,
      receiverId,
      message,
      status: "sent",
    });
    await newMessage.save();
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message, lastMessageAt: Date.now() });

    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }
    io.to(conversationId).emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.userId);
    activeUsers.delete(socket.userId);
  });
});

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

server.listen(3000, () => {
  connect();
  console.log("Backend server is running on port 8800");
  console.log("API Docs available at http://localhost:8800/api-docs");
});
