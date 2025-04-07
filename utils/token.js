import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const JWT_KEY = process.env.JWT_KEY || crypto.randomBytes(64).toString("hex");
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || crypto.randomBytes(64).toString("hex");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, isSeller: user.isSeller }, JWT_KEY, {
    expiresIn: "15m", // Access token expires in 15 minutes
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, REFRESH_TOKEN_KEY, {
    expiresIn: "30d", // Refresh token expires in 30 days
  });
};

export { generateAccessToken, generateRefreshToken, JWT_KEY, REFRESH_TOKEN_KEY };
