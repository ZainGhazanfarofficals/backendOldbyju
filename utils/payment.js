import Razorpay from "razorpay";
import dotenv from "dotenv";
import axios from "axios"; // Required for Payout API
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentLink = async (amount, currency, buyerEmail) => {
  try {
    const response = await razorpay.paymentLink.create({
      amount: amount * 100, // Convert to cents
      currency,
      description: "Order Payment",
      customer: { email: buyerEmail },
      notify: { email: true, sms: true },
      callback_url: 'https://www.oldbyju.com/', // Define success URL in .env
      callback_method: "get",
    });
    
    console.log("Generated Payment Link:", response);
    return response;
     
  } catch (err) {
    console.error("Error creating payment link:", err);
    throw new Error("Failed to create Razorpay payment link");
  }
};


export const transferPaymentToSeller = async (sellerAccountId, amount, currency) => {
  try {
    const response = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      {
        account_number: process.env.RAZORPAY_PAYOUT_ACCOUNT, // Your business Razorpay Account No.
        fund_account_id: sellerAccountId, // Razorpay Seller ID
        amount: amount * 100, // Convert to cents
        currency,
        mode: "NEFT", // Other options: IMPS, UPI
        purpose: "payout",
        queue_if_low_balance: true,
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error transferring payment:", err);
    throw new Error("Failed to transfer payment to seller");
  }
};
