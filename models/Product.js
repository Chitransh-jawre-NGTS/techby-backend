
// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     desc: String,
//     category: String,
//     totalPrice: { type: Number },
//     discountPrice: { type: Number },

//     // ✅ FIXED (store url + public_id)
//     imageUrls: [
//       {
//         url: String,
//         public_id: String,
//       },
//     ],

//     attributes: { type: Object },
//     featured: { type: Boolean, default: false },
//     deliveryAvailable: { type: Boolean, default: false },
//     sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },

//     // expiry
//     expiresAt: {
//       type: Date,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Auto delete after expiry (MongoDB TTL)
// productSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model("Product", productSchema);







const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    desc: { type: String, default: "" },

    category: { type: String, required: true },

    totalPrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },

    imageUrls: [
      {
        url: String,
        public_id: String,
      },
    ],

    attributes: {
  brand: String,
  model: String,
  storage: String,
  ram: String,
  condition: String,
  color: String,

  location: {
    city: String,
    state: String,
    district: String,
    country: String,
    postalCode: String,
    lat: String,
    lng: String,
    display_name: String,
  }
},

    featured: { type: Boolean, default: false },
    deliveryAvailable: { type: Boolean, default: false },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    city: { type: String },

    // 🔥 LIFECYCLE SYSTEM (OLX STYLE)
    status: {
      type: String,
      enum: ["active", "expired", "disabled", "deleted"],
      default: "active",
    },

    // When product becomes inactive
    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      index: true,
    },

    // when it should be fully deleted
    deleteAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
      index: true,
    },

    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },
    
  },
  { timestamps: true }
);

// indexes
productSchema.index({ category: 1 });
productSchema.index({ name: "text", desc: "text" });

module.exports = mongoose.model("Product", productSchema);