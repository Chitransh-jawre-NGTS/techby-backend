// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   desc: String,
//   category: String,
//   price: { type: Number },       // total price
//   discountPrice: { type: Number },               // optional
//   imageUrl: String,
//   attributes: { type: Object },                  // dynamic fields like brand, model, etc.
//   sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }
// });

// module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: String,
    category: String,
    totalPrice: { type: Number },         // matches frontend
    discountPrice: { type: Number },      // optional
    imageUrls: [String],                  // array for multiple images
    attributes: { type: Object },         // dynamic fields like brand, model, etc.
    featured: { type: Boolean, default: false },
    deliveryAvailable: { type: Boolean, default: false },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);