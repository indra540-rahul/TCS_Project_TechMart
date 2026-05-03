import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, allowRoles("admin"), createCategory);
router.put("/:id", protect, allowRoles("admin"), updateCategory);
router.delete("/:id", protect, allowRoles("admin"), deleteCategory);

export default router;
