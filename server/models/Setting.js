import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "TechMart Pro" },
    supportEmail: { type: String, default: "support@techmart.com" },
    supportPhone: { type: String, default: "+91 90000 00000" },
    gstNumber: { type: String, default: "GSTIN-TECHMART-001" },
    warehouseAddress: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    taxRate: { type: Number, default: 18 },
    shippingFee: { type: Number, default: 199 },
    highDiscountApprovalLimit: { type: Number, default: 20 },
    allowGuestCheckout: { type: Boolean, default: true },
    lowStockNotificationEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
