import express from "express";
import {
  createProduct,
  deleteProduct,
  getDemandPredictions,
  getLowStockProducts,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/low-stock", protect, getLowStockProducts);
router.get("/demand-prediction", protect, getDemandPredictions);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, allowRoles("admin", "manager"), createProduct);
router.put("/:id", protect, allowRoles("admin", "manager"), updateProduct);
router.delete("/:id", protect, allowRoles("admin"), deleteProduct);

export default router;
