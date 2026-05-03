import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendRecoveryCode } from "../utils/recoveryDelivery.js";

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizePhone = (phone = "") => phone.replace(/\D/g, "");
const validRoles = new Set(["admin", "manager"]);
const validStatuses = new Set(["active", "inactive"]);
const hashResetCode = (code) => crypto.createHash("sha256").update(code).digest("hex");
const generateResetCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");
const findUserByIdentifier = (identifier = "") => {
  const trimmed = identifier.trim();
  return trimmed.includes("@")
    ? User.findOne({ email: normalizeEmail(trimmed) })
    : User.findOne({ phone: normalizePhone(trimmed) });
};
const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  return `${name?.slice(0, 2) || ""}***@${domain || ""}`;
};
const maskPhone = (phone = "") => {
  const cleaned = normalizePhone(phone);
  return cleaned ? `*** *** ${cleaned.slice(-4)}` : "";
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, avatar, status } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (role && !validRoles.has(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
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
      role,
      avatar,
      status
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is inactive. Contact an administrator." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { identifier, channel = "email" } = req.body;

    if (!identifier?.trim()) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    if (!["email", "phone"].includes(channel)) {
      return res.status(400).json({ message: "Invalid recovery channel" });
    }

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({ message: "No user found for that email or phone" });
    }

    const destination = channel === "phone" ? normalizePhone(user.phone) : user.email;
    if (!destination) {
      return res.status(400).json({ message: `This account does not have a ${channel} contact configured` });
    }

    const code = generateResetCode();
    user.resetCodeHash = hashResetCode(code);
    user.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.resetCodeChannel = channel;
    await user.save();

    const delivery = await sendRecoveryCode({
      channel,
      to: destination,
      code,
      userName: user.name
    });

    res.json({
      message: `Recovery code sent to your ${channel}`,
      channel,
      destinationHint: channel === "phone" ? maskPhone(destination) : maskEmail(destination),
      previewCode: delivery.previewCode || ""
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send recovery code", error: error.message });
  }
};

export const resetPasswordWithCode = async (req, res) => {
  try {
    const { identifier, code, newPassword } = req.body;

    if (!identifier?.trim() || !code?.trim() || !newPassword) {
      return res.status(400).json({ message: "Identifier, code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await findUserByIdentifier(identifier);

    if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
      return res.status(400).json({ message: "No active recovery request found" });
    }

    if (user.resetCodeExpiresAt.getTime() < Date.now()) {
      user.resetCodeHash = "";
      user.resetCodeExpiresAt = null;
      user.resetCodeChannel = "";
      await user.save();
      return res.status(400).json({ message: "Recovery code has expired. Request a new one." });
    }

    if (user.resetCodeHash !== hashResetCode(code.trim())) {
      return res.status(400).json({ message: "Invalid recovery code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCodeHash = "";
    user.resetCodeExpiresAt = null;
    user.resetCodeChannel = "";
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};
