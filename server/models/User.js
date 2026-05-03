import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true, default: "" },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager"], default: "manager" },
    avatar: { type: String, default: "" },
    status: { type: String, default: "active" },
    resetCodeHash: { type: String, default: "" },
    resetCodeExpiresAt: { type: Date, default: null },
    resetCodeChannel: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
