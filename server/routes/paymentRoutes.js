import crypto from "crypto";
import express from "express";
import Razorpay from "razorpay";
import { createOrderRecord } from "../controllers/orderController.js";

const router = express.Router();

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

router.get("/razorpay/config", (_req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID || ""
  });
});

router.post("/razorpay/order", async (req, res) => {
  try {
    const { amount, receipt, notes = {} } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required" });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to create Razorpay order" });
  }
});

router.post("/razorpay/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Razorpay payment verification data is required" });
    }

    if (!orderPayload) {
      return res.status(400).json({ message: "Order payload is required for verification" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await createOrderRecord({
      ...orderPayload,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      paymentReference: razorpay_payment_id,
      paymentProvider: "razorpay"
    });

    res.status(201).json({
      success: true,
      message: "Payment verified and order created successfully",
      order
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Payment verification failed" });
  }
});

export default router;
