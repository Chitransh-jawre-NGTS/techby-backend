// routes/payment.js

const express = require("express");
const router = express.Router();
require("dotenv").config();
const Order = require("../models/Order");
const product = require("../models/Product");
const sellerAuth = require("../middleware/AuthMiddleware");

router.post("/create-order", async (req, res) => {
  try {
    const {
      amount,
      productId,
      productSize,
      customerName,
      customerPhone,
      city,
      pickupAddress,
      deliveryAddress,
      paymentType
    } = req.body;

    // ✅ GET PRODUCT FROM DB
    const product = await require("../models/Product").findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ TAKE sellerId FROM PRODUCT
    const sellerId = product.sellerId;

    const newOrder = await Order.create({
      sellerId, 
      productId: product._id,
      productName: product.name,

      amount,
      productSize,
      customerName,
      customerPhone,
      city,
      pickupAddress,
      deliveryAddress,
      paymentType,

      status: "pending",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/seller/orders", sellerAuth, async (req, res) => {
  try {

    const sellerId = req.seller._id; // ✅ FIXED

    const orders = await Order.find({ sellerId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
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



module.exports = router;