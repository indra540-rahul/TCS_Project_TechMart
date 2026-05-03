import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    action: {
      type: String,
      enum: ["stock-in", "stock-out", "order-placed", "order-cancelled", "manual-update"],
      required: true
    },
    quantityChanged: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("InventoryLog", inventoryLogSchema);
