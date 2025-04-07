import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import { JWT_KEY } from "../utils/token.js";
import User from "../models/user.model.js";


export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next(createError(401, "You are not authenticated!"));

  jwt.verify(token, JWT_KEY, async (err, payload) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    next();
  });
};


export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};



export const verifyTokenSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: No token provided"));

    jwt.verify(token, JWT_KEY, (err, payload) => {
      if (err) return next(new Error("Authentication error: Invalid token"));
      socket.userId = payload.id;
      next();
    });
  } catch (err) {
    next(new Error("Authentication error"));
  }
};