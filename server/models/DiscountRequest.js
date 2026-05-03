import mongoose from "mongoose";

const discountRequestSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    percentage: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("DiscountRequest", discountRequestSchema);
