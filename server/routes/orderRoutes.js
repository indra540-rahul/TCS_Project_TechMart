import express from "express";
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrderHistory,
  getOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/history", getOrderHistory);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/status", protect, allowRoles("admin", "manager"), updateOrderStatus);
router.put("/:id/cancel", protect, allowRoles("admin"), cancelOrder);
router.delete("/:id", protect, allowRoles("admin"), deleteOrder);

export default router;
