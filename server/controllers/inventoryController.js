import Product from "../models/Product.js";
import InventoryLog from "../models/InventoryLog.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { predictDemand } from "../utils/demandPrediction.js";
import { getReorderSuggestion } from "../utils/reorderSuggestion.js";
import { createAuditLog, createInventoryLog, createNotification, ensureLowStockNotification } from "../utils/inventoryHelpers.js";

export const getInventoryLogs = async (_req, res) => {
  try {
    const logs = await InventoryLog.find().populate("product", "name sector").sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory logs", error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { stock, note } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const previousStock = product.stock;
    product.stock = Number(stock);
    await product.save();

    await createInventoryLog({
      productId: product._id,
      action: "manual-update",
      quantityChanged: product.stock - previousStock,
      previousStock,
      newStock: product.stock,
      note: note || "Manual stock update"
    });

    await ensureLowStockNotification(product);
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Stock updated",
      module: "inventory",
      details: `${product.name} stock changed from ${previousStock} to ${product.stock}`
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update stock", error: error.message });
  }
};

export const getReorderSuggestions = async (_req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find().populate("category", "name"),
      Order.find({ orderStatus: { $ne: "cancelled" } }).select("items")
    ]);

    const suggestions = [];

    for (const product of products) {
      const demandData = predictDemand(product, orders);
      const reorderData = getReorderSuggestion(product, demandData);

      if (reorderData.shouldReorder) {
        suggestions.push({
          _id: product._id,
          name: product.name,
          stock: product.stock,
          lowStockLimit: product.lowStockLimit,
          predictedDemand: demandData.level,
          averageSoldQuantity: demandData.averageSoldQuantity,
          recommendedReorderQty: reorderData.recommendedReorderQty,
          reason: reorderData.reason
        });

        const existingNotification = await Notification.findOne({
          type: "reorder",
          isRead: false,
          message: { $regex: product.name, $options: "i" }
        });

        if (!existingNotification) {
          await createNotification({
            title: "Smart Reorder Suggestion",
            message: `${product.name} is recommended for reorder. Suggested qty: ${reorderData.recommendedReorderQty}.`,
            type: "reorder"
          });
        }
      }
    }

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reorder suggestions", error: error.message });
  }
};
