import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { createAuditLog } from "../utils/inventoryHelpers.js";

export const getCategories = async (_req, res) => {
  try {
    const categories = await Category.find().lean();
    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, item) => {
      acc[String(item._id)] = item.count;
      return acc;
    }, {});

    res.json(
      categories.map((category) => ({
        ...category,
        productCount: countMap[String(category._id)] || 0
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Category created",
      module: "categories",
      details: `${category.name} category created`
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Category updated",
      module: "categories",
      details: `${category.name} category updated`
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Category deleted",
      module: "categories",
      details: `${category.name} category deleted`
    });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
};
