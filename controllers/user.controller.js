import User from "../models/user.model.js";
import Razorpay from "razorpay";
import createError from "../utils/createError.js";
import { uploadToCloudinary } from "../utils/upload.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail", // or any service you use
  auth: {
    user: process.env.EMAIL_USER, // Your email from env
    pass: process.env.EMAIL_PASS, // Your email password from env
  },
});

// ✅ Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    let { profilePicture, education, jobExperience, personalProjects, keywords } = req.body;

    if (req.file) {
      const uploadedFile = await uploadToCloudinary(req.file.path);
      profilePicture = uploadedFile.url;
    }

    // If keywords are provided as a comma-separated string, convert them to an array
    if (typeof keywords === "string") {
      keywords = keywords.split(",").map((keyword) => keyword.trim());
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(profilePicture && { profilePicture }),
        ...(education && { education }),
        ...(jobExperience && { jobExperience }),
        ...(personalProjects && { personalProjects }),
        ...(keywords && { keywords }),
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};


// ✅ Get logged-in user's profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return next(createError(404, "User not found"));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// ✅ Get user stats: completed orders & available payout
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const completedOrdersCount = await Order.countDocuments({
      sellerId: userId,
      orderStatus: "completed",
    });

    const user = await User.findById(userId).select("earnedBalance");
    if (!user) return next(createError(404, "User not found"));

    res.status(200).json({
      completedOrders: completedOrdersCount,
      availablePayout: user.earnedBalance || 0,
      AmountEarned: user.paymentsReceived,
      AmountSpent : user.paymentsMade
    });
  } catch (err) {
    next(err);
  }
};

export const transferPayout = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { amount, currency = "USD", recipientId } = req.body;

    if (!amount || !recipientId) {
      return next(createError(400, "Amount and recipient ID are required"));
    }

    // Fetch user and check balance
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));

    if (user.earnedBalance < amount) {
      return next(createError(400, "Insufficient balance for payout"));
    }

    // Create transfer via Razorpay
    const transfer = await razorpay.transfers.create({
      amount: amount * 100, // Convert to cents
      currency,
      recipient_id: recipientId, // Razorpay account of the seller
      notes: {
        transfer_for: "Payout",
        userId: userId,
      },
    });

    // Update user's balance and stats
    user.earnedBalance -= amount;
    user.paymentsMade += amount;
    await user.save();

    res.status(200).json({
      message: "Payout transferred successfully",
      transferDetails: transfer,
      remainingBalance: user.earnedBalance,
    });
  } catch (err) {
    console.error("Error in transferPayout:", err);
    next(createError(500, "Payout transfer failed"));
  }
};
// student id : 67c1888005c816794973b2d7
// teacher id : 67c0eccfc2d9c02208aa0fb1

// ✅ Public endpoint to explore teachers with keyword and rating filters
export const exploreTeachers = async (req, res, next) => {
  try {
    const { keyword, minimumRating } = req.query;

    const filter = { role: "teacher" };

    if (keyword) {
      filter.keywords = { $regex: keyword, $options: "i" };
    }

    if (minimumRating) {
      filter.averageRating = { $gte: Number(minimumRating) };
    }

    const teachers = await User.find(filter).select("-password");

    res.status(200).json(teachers);
  } catch (err) {
    next(err);
  }
};


// ✅ Public Contact Us
export const contactUs = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return next(createError(400, "All fields are required."));
    }

    await transporter.sendMail({
      from: email,
      to: process.env.ADMIN_EMAIL, // Your admin/support email
      subject: `Contact Us - Message from ${name}`,
      text: message,
    });

    res.status(200).json({ message: "Your message has been sent successfully." });
  } catch (err) {
    console.error("Error in contactUs:", err);
    next(createError(500, "Failed to send message."));
  }
};

// ✅ Authenticated Report Issue
export const reportIssue = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { issue } = req.body;
    if (!issue) {
      return next(createError(400, "Issue description is required."));
    }

    const user = await User.findById(userId);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Your admin/support email
      subject: `Report Issue - UserName: ${user.username} - User ID: ${userId}`,
      text: ` User Email: ${user.username,user.email} \n  issue: ${issue}`,
    });

    res.status(200).json({ message: "Issue reported successfully." });
  } catch (err) {
    console.error("Error in reportIssue:", err);
    next(createError(500, "Failed to report issue."));
  }
};