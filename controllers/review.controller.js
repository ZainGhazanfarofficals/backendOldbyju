import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import createError from "../utils/createError.js";
import User from '../models/user.model.js';

export const submitReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating || !comment) {
      return next(createError(400, "Order ID, rating, and comment are required."));
    }

    const order = await Order.findById(orderId);
    if (!order) return next(createError(404, "Order not found"));

    const reviewerId = req.userId;
    let revieweeId, role;

    if (order.buyerId.toString() === reviewerId) {
      revieweeId = order.sellerId;
      role = "student";
    } else if (order.sellerId.toString() === reviewerId) {
      revieweeId = order.buyerId;
      role = "teacher";
    } else {
      return next(createError(403, "Unauthorized to review this order."));
    }

    const existingReview = await Review.findOne({ orderId, reviewerId });
    if (existingReview) {
      return next(createError(400, "You have already submitted a review for this order."));
    }

    const newReview = new Review({
      orderId,
      reviewerId,
      revieweeId,
      rating,
      comment,
      role,
    });

    await newReview.save();

    // ✅ Update average rating of the reviewed user
    const reviews = await Review.find({ revieweeId });
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings / reviews.length;

    await User.findByIdAndUpdate(revieweeId, { averageRating });

    res.status(201).json({
      message: "Review submitted successfully.",
      review: newReview,
    });
  } catch (err) {
    next(err);
  }
};



export const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};