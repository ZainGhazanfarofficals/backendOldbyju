import Order from "../models/order.model.js";
import Job from "../models/job.model.js";
import createError from "../utils/createError.js";
import { createPaymentLink } from "../utils/payment.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
// import { transferPaymentToSeller } from "../utils/payment.js";

export const createOrder = async (req, res, next) => {
  try {
    const { jobId, sellerId, price, currency } = req.body;

    // Validate required fields
    if (!jobId || !sellerId || !price || !currency) {
      return next(createError(400, 'Missing required fields'));
    }

    // Validate currency
    if (!['USD', 'EUR'].includes(currency)) {
      return next(createError(400, 'Invalid currency'));
    }

    // Fetch job details
    const job = await Job.findById(jobId);
    if (!job || job.buyerId.toString() !== req.userId) {
      return next(createError(403, 'Unauthorized'));
    }
    console.log("job", job.buyerId.toString());
    const existingUser = await User.findOne({_id:job.buyerId.toString()});
    // Check job status
    if (job.status !== 'open') {
      return next(createError(400, 'Job is not available'));
    }

    // Create Razorpay payment link
    const paymentLink = await createPaymentLink(price, currency, existingUser.email);

    // Create new order with paymentLinkId
    const newOrder = new Order({
      jobId,
      sellerId,
      buyerId: req.userId,
      price,
      currency,
      paymentLinkId: paymentLink.id, // Store payment link ID
      status: 'pending', // Initial status
    });

    await newOrder.save();

    // Update job status
    job.status = 'hired';
    await job.save();

    res.status(201).json({
      message: 'Order placed successfully. Complete payment using the link.',
      order: newOrder,
      paymentLink: paymentLink.short_url,
    });
  } catch (err) {
    console.error('Error in createOrder:', err);
    next(err);
  }
};



export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return next(createError(404, "Order not found"));

    if (order.buyerId.toString() !== req.userId && order.sellerId.toString() !== req.userId) {
      return next(createError(403, "Unauthorized"));
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
    }).populate("jobId");
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};



export const completeOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return next(createError(400, "Order ID is required"));

    const order = await Order.findById(orderId);
    if (!order) return next(createError(404, "Order not found"));

    if (order.paymentStatus !== "paid") {
      return next(createError(400, "Cannot complete order. Payment is pending."));
    }

    if (order.orderStatus === "completed") {
      return next(createError(400, "Order already completed."));
    }

    // ✅ Check if the buyer has submitted a review
    const buyerReview = await Review.findOne({
      orderId: orderId,
      reviewerId: order.buyerId,
    });

    if (!buyerReview) {
      return next(createError(400, "Cannot complete order. Buyer must submit a review first."));
    }

    // ✅ Calculate 80% earnings for the seller
    const sellerEarnings = order.price * 0.8;

    // ✅ Complete the order
    order.orderStatus = "completed";
    await order.save();

    // ✅ Update seller's earnings and stats
    await User.findByIdAndUpdate(order.sellerId, {
      $inc: {
        earnedBalance: sellerEarnings,
        ordersCompleted: 1,
        paymentsReceived: sellerEarnings,
      },
    });

    res.status(200).json({
      message: "Order marked as completed. 80% earnings added to seller.",
      order,
      sellerEarnings,
    });
  } catch (err) {
    next(err);
  }
};
