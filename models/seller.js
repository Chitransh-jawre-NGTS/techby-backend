const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // for authentication
    shopName: { type: String, required: true },
    phone: { type: String },
    logo: { type: String, default: "" }, // new field for shop logo
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seller', sellerSchema);