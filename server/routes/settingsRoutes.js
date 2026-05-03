import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getSettings);
router.put("/", protect, allowRoles("admin"), updateSettings);

export default router;
