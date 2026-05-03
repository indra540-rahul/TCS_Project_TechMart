import express from "express";
import { approveDiscount } from "../controllers/discountController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.put("/:id/approve", protect, allowRoles("admin"), approveDiscount);

export default router;
