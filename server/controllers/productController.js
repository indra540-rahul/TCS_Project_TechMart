import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { predictDemand } from "../utils/demandPrediction.js";
import { getReorderSuggestion } from "../utils/reorderSuggestion.js";
import { createAuditLog, createNotification, ensureLowStockNotification } from "../utils/inventoryHelpers.js";

const buildQuery = ({ search, category, sector, status }) => {
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (sector) query.sector = sector;
  if (status) query.status = status;
  return query;
};

const enrichProducts = async (products) => {
  const orders = await Order.find({ orderStatus: { $ne: "cancelled" } }).select("items");

  return products.map((product) => {
    const demandData = predictDemand(product, orders);
    const reorderData = getReorderSuggestion(product, demandData);

    return {
      ...product.toObject(),
      predictedDemand: demandData.level,
      demandScore: demandData.score,
      averageSoldQuantity: demandData.averageSoldQuantity,
      reorderSuggestion: reorderData
    };
  });
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(buildQuery(req.query)).populate("category", "name");
    const enriched = await enrichProducts(products);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [enriched] = await enrichProducts([product]);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const product = await Product.create(req.body);
    await ensureLowStockNotification(product);
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Product created",
      module: "products",
      details: `${product.name} created in ${product.sector}`
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await ensureLowStockNotification(product);
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Product updated",
      module: "products",
      details: `${product.name} updated`
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await createNotification({
      title: "Product Deleted",
      message: `${product.name} has been removed from the catalog.`,
      type: "system"
    });
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Product deleted",
      module: "products",
      details: `${product.name} deleted`
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

export const getLowStockProducts = async (_req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockLimit"] }
    }).populate("category", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch low stock products", error: error.message });
  }
};

export const getDemandPredictions = async (_req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    const enriched = await enrichProducts(products);
    res.json(
      enriched.map((product) => ({
        _id: product._id,
        name: product.name,
        stock: product.stock,
        totalSold: product.totalSold,
        predictedDemand: product.predictedDemand,
        demandScore: product.demandScore,
        reorderSuggestion: product.reorderSuggestion
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch demand predictions", error: error.message });
  }
};
