import bcrypt from "bcrypt";
import crypto from "crypto";
import sanitize from "mongo-sanitize";
import { redisClient } from "../index.js";
import User from "../models/user.model.js";
import { registerSchema } from "../config/zod.config.js";
import tryCatch from "../middleware/tryCatch.middleware.js";
import { getVerifyEmailHtml } from "../config/html.config.js";
import sendMail from "../config/sendMail.config.js";

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
