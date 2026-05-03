import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    password: { type: String, default: "" },
    avatar: { type: String, default: "" },
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" }
    },
    resetCodeHash: { type: String, default: "" },
    resetCodeExpiresAt: { type: Date, default: null },
    resetCodeChannel: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
