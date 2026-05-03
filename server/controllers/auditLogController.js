import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (_req, res) => {
  try {
    const logs = await AuditLog.find().populate("user", "name email").sort({ createdAt: -1 }).limit(150);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
  }
};
