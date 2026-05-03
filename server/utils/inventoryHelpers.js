import InventoryLog from "../models/InventoryLog.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";

export const createInventoryLog = async ({
  productId,
  action,
  quantityChanged,
  previousStock,
  newStock,
  note = ""
}) => {
  await InventoryLog.create({
    product: productId,
    action,
    quantityChanged,
    previousStock,
    newStock,
    note
  });
};

export const createNotification = async ({ title, message, type = "system" }) => {
  return Notification.create({ title, message, type });
};

export const ensureLowStockNotification = async (product) => {
  if (product.stock <= product.lowStockLimit) {
    await createNotification({
      title: "Low Stock Alert",
      message: `${product.name} is running low with only ${product.stock} units left.`,
      type: "low-stock"
    });
  }
};

export const createAuditLog = async ({ user, role, action, module, details }) => {
  await AuditLog.create({
    user: user || null,
    role,
    action,
    module,
    details
  });
};
