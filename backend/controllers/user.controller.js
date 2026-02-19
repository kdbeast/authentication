import User from "../models/user.model.js";
import tryCatch from "../middleware/tryCatch.middleware.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../config/zod.config.js";

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

  //   const user = await User.create({
  //     username,
  //     email,
  //     password,
  //   });

  return res.status(201).json({
    message: "User registered successfully",
    username,
    email,
    password,
  });
});
