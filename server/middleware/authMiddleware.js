import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tokenType === "customer") {
      return res.status(401).json({ message: "Customer tokens cannot access admin routes" });
    }

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (_error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export const protectCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Customer token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tokenType !== "customer") {
      return res.status(401).json({ message: "Invalid customer token" });
    }

    req.customer = await Customer.findById(decoded.userId).select("-password -resetCodeHash");

    if (!req.customer) {
      return res.status(401).json({ message: "Customer not found" });
    }

    next();
  } catch (_error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};
