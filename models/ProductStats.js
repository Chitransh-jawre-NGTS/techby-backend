const mongoose = require("mongoose");

const productStatsSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true, // 🔥 THIS IS THE FIX
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductStats", productStatsSchema);

// const mongoose = require("mongoose");

// const platformStatsSchema = new mongoose.Schema(
//   {
//     totalViews: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("PlatformStats", platformStatsSchema);