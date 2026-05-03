import express from "express";
import { createManager, getUsers, updateUserStatus } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));
router.post("/create-manager", createManager);
router.get("/", getUsers);
router.put("/:id/status", updateUserStatus);

export default router;
