import express from "express";
import {
  getCategoryPerformance,
  getDashboardSummary,
  getInventoryReport,
  getOrderStatusReport,
  getProfitReport,
  getSalesReport,
  getTopProducts,
  exportReports
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/dashboard-summary", getDashboardSummary);
router.get("/sales", getSalesReport);
router.get("/top-products", getTopProducts);
router.get("/inventory", getInventoryReport);
router.get("/order-status", getOrderStatusReport);
router.get("/category-performance", getCategoryPerformance);
router.get("/profit", allowRoles("admin"), getProfitReport);
router.get("/export", allowRoles("admin"), exportReports);

export default router;
