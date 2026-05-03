import bcrypt from "bcryptjs";
import crypto from "crypto";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/mailer.js";
import { sendRecoveryCode } from "../utils/recoveryDelivery.js";

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizePhone = (phone = "") => phone.replace(/\D/g, "");
const hashResetCode = (code) => crypto.createHash("sha256").update(code).digest("hex");
const generateResetCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");
const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  return `${name?.slice(0, 2) || ""}***@${domain || ""}`;
};
const maskPhone = (phone = "") => {
  const cleaned = normalizePhone(phone);
  return cleaned ? `*** *** ${cleaned.slice(-4)}` : "";
};

const buildCustomerPayload = (customer) => ({
  _id: customer._id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  avatar: customer.avatar,
  address: customer.address
});

const sendWelcomeEmail = async (customer) => {
  await sendEmail({
    to: customer.email,
    subject: "Welcome to TechMart Pro",
    text: `Hello ${customer.name}, your TechMart Pro account has been created successfully. You can now sign in, shop electronics, track orders, and manage your profile.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;background:white;border-radius:20px;padding:32px;border:1px solid #e2e8f0;">
          <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
            Welcome
          </div>
          <h1 style="margin:18px 0 10px;font-size:28px;line-height:1.2;">Your TechMart Pro account is ready</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#475569;">
            Hello ${customer.name}, your signup was successful. You can now explore the electronics catalog, place orders, track deliveries, and manage your profile from your customer workspace.
          </p>
          <div style="margin:24px 0;padding:18px 20px;border-radius:16px;background:#eff6ff;border:1px solid #bfdbfe;">
            <p style="margin:0;font-size:14px;color:#1e3a8a;"><strong>Registered email:</strong> ${customer.email}</p>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.8;color:#64748b;">
            Thank you for joining TechMart Pro.
          </p>
        </div>
      </div>
    `
  });
};

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, address = {} } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    let customer = await Customer.findOne({ email: normalizedEmail });

    if (customer?.password) {
      return res.status(400).json({ message: "An account already exists for this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = {
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0f172a&color=ffffff`,
      address: {
        line1: address.line1 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "India"
      }
    };

    if (customer) {
      Object.assign(customer, payload);
      await customer.save();
    } else {
      customer = await Customer.create(payload);
    }

    sendWelcomeEmail(customer).catch((error) => {
      console.error("Welcome email failed:", error.message);
    });

    res.status(201).json({
      message: "Customer account created successfully",
      token: generateToken(customer._id, "customer"),
      customer: buildCustomerPayload(customer)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create customer account", error: error.message });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const customer = await Customer.findOne({ email: normalizedEmail });
    if (!customer || !customer.password) {
      return res.status(401).json({ message: "Invalid customer credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid customer credentials" });
    }

    res.json({
      message: "Customer login successful",
      token: generateToken(customer._id, "customer"),
      customer: buildCustomerPayload(customer)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

export const getCustomerProfile = async (req, res) => {
  res.json(buildCustomerPayload(req.customer));
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, avatar, address = {}, password, currentPassword } = req.body;
    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name?.trim()) {
      customer.name = name.trim();
    }

    if (typeof phone === "string") {
      customer.phone = normalizePhone(phone);
    }

    if (typeof avatar === "string") {
      customer.avatar = avatar;
    }

    customer.address = {
      ...customer.address,
      line1: address.line1 ?? customer.address.line1,
      city: address.city ?? customer.address.city,
      state: address.state ?? customer.address.state,
      pincode: address.pincode ?? customer.address.pincode,
      country: address.country ?? customer.address.country
    };

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, customer.password || "");
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      customer.password = await bcrypt.hash(password, 10);
    }

    await customer.save();

    res.json({
      message: "Profile updated successfully",
      customer: buildCustomerPayload(customer)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update customer profile", error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customer._id })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders", error: error.message });
  }
};

export const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, customer: req.customer._id })
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order details", error: error.message });
  }
};

export const requestCustomerPasswordReset = async (req, res) => {
  try {
    const { identifier, channel = "email" } = req.body;
    const trimmedIdentifier = identifier?.trim() || "";

    if (!trimmedIdentifier) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    if (!["email", "phone"].includes(channel)) {
      return res.status(400).json({ message: "Invalid recovery channel" });
    }

    const customer = trimmedIdentifier.includes("@")
      ? await Customer.findOne({ email: normalizeEmail(trimmedIdentifier) })
      : await Customer.findOne({ phone: normalizePhone(trimmedIdentifier) });

    if (!customer || !customer.password) {
      return res.status(404).json({ message: "No customer account found for that email or phone" });
    }

    const destination = channel === "phone" ? normalizePhone(customer.phone) : customer.email;
    if (!destination) {
      return res.status(400).json({ message: `This account does not have a ${channel} contact configured` });
    }

    const code = generateResetCode();
    customer.resetCodeHash = hashResetCode(code);
    customer.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    customer.resetCodeChannel = channel;
    await customer.save();

    const delivery = await sendRecoveryCode({
      channel,
      to: destination,
      code,
      userName: customer.name
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

export const resetCustomerPasswordWithCode = async (req, res) => {
  try {
    const { identifier, code, newPassword } = req.body;
    const trimmedIdentifier = identifier?.trim() || "";

    if (!trimmedIdentifier || !code?.trim() || !newPassword) {
      return res.status(400).json({ message: "Identifier, code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const customer = trimmedIdentifier.includes("@")
      ? await Customer.findOne({ email: normalizeEmail(trimmedIdentifier) })
      : await Customer.findOne({ phone: normalizePhone(trimmedIdentifier) });

    if (!customer || !customer.resetCodeHash || !customer.resetCodeExpiresAt) {
      return res.status(400).json({ message: "No active recovery request found" });
    }

    if (customer.resetCodeExpiresAt.getTime() < Date.now()) {
      customer.resetCodeHash = "";
      customer.resetCodeExpiresAt = null;
      customer.resetCodeChannel = "";
      await customer.save();
      return res.status(400).json({ message: "Recovery code has expired. Request a new one." });
    }

    if (customer.resetCodeHash !== hashResetCode(code.trim())) {
      return res.status(400).json({ message: "Invalid recovery code" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    customer.resetCodeHash = "";
    customer.resetCodeExpiresAt = null;
    customer.resetCodeChannel = "";
    await customer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { phone: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    const customerIds = customers.map((customer) => customer._id);
    const orders = await Order.find({ customer: { $in: customerIds } })
      .select("customer totalAmount orderStatus paymentStatus createdAt items")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    const orderMap = orders.reduce((acc, order) => {
      const key = String(order.customer);
      if (!acc[key]) acc[key] = { count: 0, spent: 0, recentOrders: [] };
      acc[key].count += 1;
      acc[key].spent += order.totalAmount;
      if (acc[key].recentOrders.length < 3) {
        acc[key].recentOrders.push({
          _id: order._id,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          itemCount: order.items.length,
          items: order.items.map((item) => ({
            productName: item.product?.name || "Unnamed product",
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        });
      }
      return acc;
    }, {});

    res.json(customers.map((customer) => ({
      ...customer.toObject(),
      orderCount: orderMap[String(customer._id)]?.count || 0,
      totalSpent: orderMap[String(customer._id)]?.spent || 0,
      recentOrders: orderMap[String(customer._id)]?.recentOrders || []
    })));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers", error: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const orders = await Order.find({ customer: customer._id }).populate("items.product", "name");
    res.json({ ...customer.toObject(), orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customer", error: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      email: normalizeEmail(req.body.email),
      phone: normalizePhone(req.body.phone)
    };

    const customer = await Customer.create(payload);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to create customer", error: error.message });
  }
};
