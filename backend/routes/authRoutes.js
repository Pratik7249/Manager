import express from "express";
import { signup, verifyEmail, login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);

export default router;
