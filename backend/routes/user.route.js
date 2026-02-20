import express from "express";
import { verifyUser } from "../controllers/user.controller.js";
import { registerUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify/:token", verifyUser);

export default router;
