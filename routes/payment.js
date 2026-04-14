// routes/payment.js

const express = require("express");
const router = express.Router();
require("dotenv").config();
const razorpay = require("../config/razorpay");

const Order = require("../models/Order");

router.post("/create-order", async (req, res) => {
  try {
    const { amount, sellerId, product } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // ✅ SAVE IN DB
    const newOrder = await Order.create({
      razorpayOrderId: order.id,
      sellerId,
      amount,
      product,
      status: "pending",
    });

    res.json({
      ...order,
      dbOrderId: newOrder._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/payment.js (same file)

const crypto = require("crypto");

// const Order = require("../models/Order");
// GET ALL ORDERS (Admin)
router.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/admin/order/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // ✅ UPDATE DB
    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
      }
    );

    return res.json({ success: true });
  } else {
    return res.status(400).json({ success: false });
  }
});

module.exports = router;