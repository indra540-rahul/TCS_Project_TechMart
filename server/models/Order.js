import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    subtotalAmount: { type: Number, default: 0, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    codCharge: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentReference: { type: String, default: "" },
    paymentProvider: { type: String, default: "" },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "dispatch", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    shippingMethod: { type: String, default: "standard" },
    shippingAddress: {
      city: String,
      state: String,
      pincode: String,
      country: String,
      line1: String
    },
    customerSnapshot: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
