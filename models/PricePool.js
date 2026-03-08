const mongoose = require("mongoose");

const pricePoolSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // or Seller
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PricePool", pricePoolSchema);