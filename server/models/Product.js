import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    name: String,
    value: String
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, default: "" },
    sector: {
      type: String,
      enum: ["electronics"],
      default: "electronics"
    },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    unit: {
      type: String,
      enum: ["piece", "kg", "gram", "liter", "pack"],
      default: "piece"
    },
    stock: { type: Number, default: 0, min: 0 },
    lowStockLimit: { type: Number, default: 5, min: 0 },
    variants: [variantSchema],
    attributes: { type: Map, of: String, default: {} },
    expiryDate: Date,
    image: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    totalSold: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
