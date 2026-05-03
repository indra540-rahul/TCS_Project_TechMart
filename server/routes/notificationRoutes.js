import express from "express";
import {
  createPublicContactMessage,
  deleteNotification,
  getNotifications,
  markNotificationRead
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/contact", createPublicContactMessage);

router.use(protect);
router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.delete("/:id", allowRoles("admin"), deleteNotification);

export default router;
