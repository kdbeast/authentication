import express from "express";
import {
  verifyOtp,
  loginUser,
  verifyUser,
  registerUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);

router.post("/login", loginUser);
router.post("/verify", verifyOtp);

export default router;
