import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "manager"], required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    details: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
