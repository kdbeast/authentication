import express from "express";
import {
  logout,
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
router.post("/logout", isAuth, logout);

export default router;
