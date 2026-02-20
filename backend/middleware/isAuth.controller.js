import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import User from "../models/user.model.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedData) {
      return res.status(400).json({
        message: "Token is invalid or expired",
      });
    }

    const user = await User.findById(decodedData.id).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    await redisClient.setEx(
      `user:${decodedData.id}`,
      3600,
      JSON.stringify(user),
    );
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }
    return res.status(500).json({
      message: error.message,
    });
  }
};
