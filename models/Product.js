// // const mongoose = require("mongoose");

// // const productSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   desc: String,
// //   category: String,
// //   price: { type: Number },       // total price
// //   discountPrice: { type: Number },               // optional
// //   imageUrl: String,
// //   attributes: { type: Object },                  // dynamic fields like brand, model, etc.
// //   sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }
// // });

// // module.exports = mongoose.model("Product", productSchema);



// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     desc: String,
//     category: String,
//     totalPrice: { type: Number },         // matches frontend
//     discountPrice: { type: Number },      // optional
//     imageUrls: [String],                  // array for multiple images
//     attributes: { type: Object },         // dynamic fields like brand, model, etc.
//     featured: { type: Boolean, default: false },
//     deliveryAvailable: { type: Boolean, default: false },
//     sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
//   },
//   { timestamps: true }
// );

// // ✅ Add this field
// productSchema.add({
//   expiresAt: {
//     type: Date,
//     required: true,
//   },
// });
// module.exports = mongoose.model("Product", productSchema);



// // const mongoose = require("mongoose");

// // const productSchema = new mongoose.Schema(
// //   {
// //     name: { type: String, required: true },
// //     desc: String,
// //     category: String,
// //     totalPrice: Number,
// //     discountPrice: Number,

// //     // ✅ FIX THIS (store object, not string)
// //     imageUrls: [
// //       {
// //         url: String,
// //         public_id: String,
// //       },
// //     ],

// //     attributes: { type: Object },
// //     featured: { type: Boolean, default: false },
// //     deliveryAvailable: { type: Boolean, default: false },
// //     sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },

// //     // ✅ expiry field
// //     expiresAt: {
// //       type: Date,
// //       required: true,
// //     },
// //   },
// //   { timestamps: true }
// // );

// // // ✅ VERY IMPORTANT (auto delete after expiry)
// // productSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// // module.exports = mongoose.model("Product", productSchema);



const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: String,
    category: String,
    totalPrice: { type: Number },
    discountPrice: { type: Number },

    // ✅ FIXED (store url + public_id)
    imageUrls: [
      {
        url: String,
        public_id: String,
      },
    ],

    attributes: { type: Object },
    featured: { type: Boolean, default: false },
    deliveryAvailable: { type: Boolean, default: false },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },

    // expiry
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Auto delete after expiry (MongoDB TTL)
productSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Product", productSchema);