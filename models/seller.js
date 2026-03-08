const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // new
    shopName: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seller', sellerSchema);