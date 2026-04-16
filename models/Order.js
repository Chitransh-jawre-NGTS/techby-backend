const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
{

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },

  productName: String,
  productSize: String,

  customerName: String,
  customerPhone: String,

  city: String,
  pickupAddress: String,
  deliveryAddress: String,

  amount: Number,
  paymentType: String,

  invoiceId: String,

  status: {
    type: String,
    enum: ["pending", "paid", "approved", "rejected", "delivered"],
    default: "pending",
  },
},
{ timestamps: true }
);
module.exports = mongoose.model("Order", orderSchema);