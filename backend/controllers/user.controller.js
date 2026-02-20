import bcrypt from "bcrypt";
import crypto from "crypto";
import sanitize from "mongo-sanitize";
import { redisClient } from "../index.js";
import User from "../models/user.model.js";
import sendMail from "../config/sendMail.config.js";
import tryCatch from "../middleware/tryCatch.middleware.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.config.js";
import { loginSchema, registerSchema } from "../config/zod.config.js";
import {
  generateAccessToken,
  generateToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../config/generateToken.config.js";

export const registerUser = tryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const errorMessages = validation.error.issues.map((issue) => issue.message);
    return res.status(400).json({
      message: errorMessages,
    });
  }

  const { username, email, password } = validation.data;

  const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify:${verifyToken}`;

  const dataToStore = {
    username,
    email,
    password: hashedPassword,
  };

  await redisClient.set(verifyKey, JSON.stringify(dataToStore), { EX: 300 });

  const subject = "Verify your email for account creation";
  const html = getVerifyEmailHtml({ email, verifyToken });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  return res.status(201).json({
    message:
      "If your email is valid you will receive an email to verify your account. It will expire in 5 minutes",
  });
});

export const verifyUser = tryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      message: "Verification token is required",
    });
  }

  const verifyKey = `verify:${token}`;

  const userDataJson = await redisClient.get(verifyKey);

  if (!userDataJson) {
    return res.status(400).json({
      message: "Verification Link is invalid or expired",
    });
  }

  await redisClient.del(verifyKey);

  const userData = JSON.parse(userDataJson);

  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const newUser = await User.create({
    username: userData.username,
    email: userData.email,
    password: userData.password,
  });

  return res.status(201).json({
    message: "Email verified successfully! Your account has been created.",
    user: {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    },
  });
});

export const loginUser = tryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = loginSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    const errorMessages = validation.error.issues.map((issue) => issue.message);
    return res.status(400).json({
      message: errorMessages,
    });
  }

  const { email, password } = validation.data;

  const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;

  if (await redisClient.get(rateLimitKey)) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

  const subject = "Verify your email for account creation";
  const html = getOtpHtml({ email, otp });

  await sendMail({ email, subject, html });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  return res.status(200).json({
    message:
      "If your email is valid, an OTP has been sent. It will expire in 5 minutes",
  });
});

export const verifyOtp = tryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const otpKey = `otp:${email}`;

  const storedOtpString = await redisClient.get(otpKey);
  if (!storedOtpString) {
    return res.status(400).json({
      message: "OTP expired",
    });
  }

  const storedOtp = JSON.parse(storedOtpString);
  if (storedOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const tokenData = await generateToken(user._id, res);

  return res.status(200).json({
    message: `Welcome ${user.username}`,
    user,
  });
});

export const myProfile = tryCatch(async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    message: "Profile fetched successfully",
    user,
  });
});

export const refreshToken = tryCatch(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const decode = await verifyRefreshToken(refreshToken);
  if (!decode) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  generateAccessToken(decode.id, res);
  return res.status(200).json({
    message: "Token refreshed successfully",
  });
});

export const logout = tryCatch(async (req, res) => {
  const userId = req.user._id;

  await revokeRefreshToken(userId);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  await redisClient.del(`user:${userId}`);

  return res.status(200).json({
    message: "Logout successful",
  });
});
