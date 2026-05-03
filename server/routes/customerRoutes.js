import express from "express";
import {
  createCustomer,
  getCustomerById,
  getCustomerProfile,
  getCustomers,
  getMyOrderById,
  getMyOrders,
  loginCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
  resetCustomerPasswordWithCode,
  updateCustomerProfile
} from "../controllers/customerController.js";
import { protect, protectCustomer } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/forgot-password/request", requestCustomerPasswordReset);
router.post("/forgot-password/reset", resetCustomerPasswordWithCode);
router.get("/me", protectCustomer, getCustomerProfile);
router.put("/me", protectCustomer, updateCustomerProfile);
router.get("/me/orders", protectCustomer, getMyOrders);
router.get("/me/orders/:orderId", protectCustomer, getMyOrderById);

router.use(protect, allowRoles("admin", "manager"));
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);

export default router;
