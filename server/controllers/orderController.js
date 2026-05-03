import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createAuditLog, createInventoryLog, createNotification, ensureLowStockNotification } from "../utils/inventoryHelpers.js";

const allowedStatusFlow = ["pending", "confirmed", "processing", "dispatch", "shipped", "delivered"];
const createHttpError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

const normalizeCurrency = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer").populate("items.product", "name image");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Customer email is required" });
    }

    const customer = await Customer.findOne({ email: normalizeEmail(email) });
    if (!customer) {
      return res.json([]);
    }

    const orders = await Order.find({ customer: customer._id })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order history", error: error.message });
  }
};

export const createOrderRecord = async (payload) => {
  const {
    customer,
    customerInfo,
    items,
    paymentMethod = "cod",
    paymentStatus,
    paymentReference = "",
    paymentProvider = "",
    shippingAddress,
    shippingMethod = "standard",
    shippingCharge = 0,
    taxAmount = 0,
    codCharge = 0
  } = payload;

  let customerId = customer;

  if (!Array.isArray(items) || !items.length) {
    throw createHttpError(400, "At least one item is required to place an order");
  }

  if (!["razorpay", "cod"].includes(paymentMethod)) {
    throw createHttpError(400, "Invalid payment method");
  }

  if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
    throw createHttpError(400, "Customer information is required");
  }

  if (!customerInfo?.address?.line1 || !customerInfo?.address?.city || !customerInfo?.address?.state || !customerInfo?.address?.pincode) {
    throw createHttpError(400, "Complete shipping address is required");
  }

  if (!customerId && customerInfo) {
    const normalizedEmail = customerInfo.email?.trim().toLowerCase();
    const normalizedPhone = customerInfo.phone?.replace(/\D/g, "");
    let existingCustomer = null;

    if (normalizedEmail) {
      existingCustomer = await Customer.findOne({ email: normalizedEmail });
    } else if (normalizedPhone) {
      existingCustomer = await Customer.findOne({ phone: normalizedPhone });
    }

    if (existingCustomer) {
      existingCustomer.name = customerInfo.name || existingCustomer.name;
      existingCustomer.phone = normalizedPhone || existingCustomer.phone;
      existingCustomer.address = {
        ...existingCustomer.address,
        ...customerInfo.address
      };
      await existingCustomer.save();
      customerId = existingCustomer._id;
    } else {
      const createdCustomer = await Customer.create({
        ...customerInfo,
        email: normalizedEmail,
        phone: normalizedPhone
      });
      customerId = createdCustomer._id;
    }
  }

  if (customerId && customerInfo) {
    await Customer.findByIdAndUpdate(customerId, {
      $set: {
        name: customerInfo.name,
        email: customerInfo.email?.trim().toLowerCase(),
        phone: customerInfo.phone?.replace(/\D/g, ""),
        address: customerInfo.address
      }
    });
  }

  if (!customerId) {
    throw createHttpError(400, "Customer information is required");
  }

  const preparedItems = [];
  let subtotalAmount = 0;

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) {
      throw createHttpError(400, "Your cart contains an old or invalid product. Please remove it and add the latest product again.");
    }

    const product = await Product.findById(item.product);
    if (!product) {
      throw createHttpError(404, "Product not found");
    }

    if (!item.quantity || item.quantity < 1) {
      throw createHttpError(400, `Invalid quantity for ${product.name}`);
    }

    if (product.stock < item.quantity) {
      throw createHttpError(400, `Insufficient stock for ${product.name}`);
    }

    const subtotal = product.price * item.quantity;
    subtotalAmount += subtotal;
    preparedItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      subtotal
    });
  }

  for (const item of preparedItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw createHttpError(404, "Product not found while finalizing the order");
    }

    const previousStock = product.stock;
    product.stock -= item.quantity;
    product.totalSold += item.quantity;
    await product.save();

    await createInventoryLog({
      productId: product._id,
      action: "order-placed",
      quantityChanged: -item.quantity,
      previousStock,
      newStock: product.stock,
      note: "Stock reduced due to new order"
    });

    await ensureLowStockNotification(product);
  }

  const normalizedShippingCharge = normalizeCurrency(shippingCharge);
  const normalizedTaxAmount = normalizeCurrency(taxAmount);
  const normalizedCodCharge = paymentMethod === "cod" ? normalizeCurrency(codCharge) : 0;
  const totalAmount = subtotalAmount + normalizedShippingCharge + normalizedTaxAmount + normalizedCodCharge;
  const resolvedPaymentStatus =
    paymentMethod === "razorpay"
      ? paymentStatus || "paid"
      : paymentStatus || "pending";
  const resolvedOrderStatus = resolvedPaymentStatus === "paid" || paymentMethod === "cod" ? "confirmed" : "pending";

  const order = await Order.create({
    customer: customerId,
    items: preparedItems,
    totalAmount,
    subtotalAmount,
    shippingCharge: normalizedShippingCharge,
    taxAmount: normalizedTaxAmount,
    codCharge: normalizedCodCharge,
    paymentMethod,
    paymentStatus: resolvedPaymentStatus,
    paymentReference,
    paymentProvider,
    orderStatus: resolvedOrderStatus,
    shippingMethod,
    shippingAddress: shippingAddress || customerInfo.address,
    customerSnapshot: {
      name: customerInfo?.name || "",
      email: customerInfo?.email?.trim().toLowerCase() || "",
      phone: customerInfo?.phone?.replace(/\D/g, "") || ""
    }
  });

  await createNotification({
    title: "New Order Received",
    message: `Order ${order._id.toString().slice(-6)} was placed successfully.`,
    type: "new-order"
  });

  return Order.findById(order._id).populate("customer").populate("items.product", "name image");
};

export const createOrder = async (req, res) => {
  try {
    const order = await createOrderRecord(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Failed to create order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be updated" });
    }

    if (!allowedStatusFlow.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    order.orderStatus = status;
    if (status === "delivered" && order.paymentMethod === "cod" && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
    }
    await order.save();
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Order status changed",
      module: "orders",
      details: `Order ${order._id.toString().slice(-6)} updated to ${status}`
    });

    if (status === "delivered") {
      await createNotification({
        title: "Order Delivered",
        message: `Order ${order._id.toString().slice(-6)} has been delivered.`,
        type: "system"
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    for (const item of order.items) {
      const productId = item.product?._id || item.product;
      if (!productId) {
        continue;
      }

      const product = await Product.findById(productId);
      if (!product) {
        continue;
      }

      const previousStock = product.stock;
      product.stock += item.quantity;
      await product.save();

      await createInventoryLog({
        productId: product._id,
        action: "order-cancelled",
        quantityChanged: item.quantity,
        previousStock,
        newStock: product.stock,
        note: "Stock restored after order cancellation"
      });

      await ensureLowStockNotification(product);
    }

    order.orderStatus = "cancelled";
    if (order.paymentStatus === "pending") {
      order.paymentStatus = "failed";
    }
    await order.save();
    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Order cancelled",
      module: "orders",
      details: `Order ${order._id.toString().slice(-6)} cancelled`
    });

    await createNotification({
      title: "Order Cancelled",
      message: `Order ${order._id.toString().slice(-6)} was cancelled and stock restored.`,
      type: "system"
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "Order deleted",
      module: "orders",
      details: `Order ${order._id.toString().slice(-6)} deleted`
    });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error: error.message });
  }
};
