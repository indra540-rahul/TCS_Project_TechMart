import express from "express";
import { getInventoryLogs, getReorderSuggestions, updateStock } from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/logs", getInventoryLogs);
router.get("/reorder-suggestions", getReorderSuggestions);
router.put("/:productId/stock", allowRoles("admin", "manager"), updateStock);

export default router;
