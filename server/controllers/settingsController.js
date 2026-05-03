import Setting from "../models/Setting.js";
import { createAuditLog } from "../utils/inventoryHelpers.js";

export const getSettings = async (_req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings", error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Settings changed",
      module: "settings",
      details: "Business settings updated"
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
};
