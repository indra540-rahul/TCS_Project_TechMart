import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createAuditLog } from "../utils/inventoryHelpers.js";

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizePhone = (phone = "") => phone.replace(/\D/g, "");
const validStatuses = new Set(["active", "inactive"]);

export const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const createManager = async (req, res) => {
  try {
    const { name, email, phone, password, avatar, status } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (status && !validStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid account status" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (normalizedPhone) {
      const existingPhoneUser = await User.findOne({ phone: normalizedPhone });
      if (existingPhoneUser) {
        return res.status(400).json({ message: "Phone number is already in use" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: "manager",
      avatar,
      status: status || "active"
    });

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Manager account created",
      module: "users",
      details: `Created manager ${user.email}`
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create manager account", error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!validStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid account status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user._id) === String(req.user._id) && status !== "active") {
      return res.status(400).json({ message: "You cannot deactivate your own admin account" });
    }

    user.status = status;
    await user.save();

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "User status updated",
      module: "users",
      details: `${user.email} marked as ${status}`
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};
