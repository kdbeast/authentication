import express from "express";
import {
  verifyOtp,
  loginUser,
  myProfile,
  verifyUser,
  registerUser,
  refreshToken,
} from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);

router.post("/login", loginUser);
router.post("/verify", verifyOtp);

router.get("/me", isAuth, myProfile);
router.post("/refresh", refreshToken);

export default router;
