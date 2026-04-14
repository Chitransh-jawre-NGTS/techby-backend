// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    razorpayOrderId: String,
    razorpayPaymentId: String,

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    product: String,
    amount: Number,

    status: {
      type: String,
      enum: ["pending", "paid", "approved", "rejected", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);