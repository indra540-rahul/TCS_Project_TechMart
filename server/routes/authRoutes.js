import express from "express";
import { getProfile, loginUser, registerUser, requestPasswordReset, resetPasswordWithCode } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password/request", requestPasswordReset);
router.post("/forgot-password/reset", resetPasswordWithCode);
router.get("/profile", protect, getProfile);

export default router;
