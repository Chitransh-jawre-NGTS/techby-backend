// const mongoose = require("mongoose");

// const sellerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     shopName: { type: String, required: true },
//     phone: { type: String, required: true },
//     logo: { type: String, required: true },
//   location: {
//   type: String,
//   required: true
// }
//   },
//   { timestamps: true }
// );


// module.exports = mongoose.model("Seller", sellerSchema);
















// const mongoose = require("mongoose");

// const sellerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     shopName: { type: String, required: true },
//     phone: { type: String, required: true },
//     logo: { type: String, default: ""},
//     location: {
//       type: String,
//   default: ""
//     },

//     // ✅ ADD THIS (IMPORTANT)
//     listingCredits: {
//       normal: { type: Number, default: 20 },   // free monthly
//       featured: { type: Number, default: 0 },
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Seller", sellerSchema);










// const mongoose = require("mongoose");

// const sellerSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     shopName: {
//       type: String,
//       required: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//     },

//     logo: {
//       type: String,
//       default: "",
//     },

//     location: {
//       type: String,
//       default: "",
//     },

//     // ================= CREDIT SYSTEM ONLY =================
//     listingCredits: {
//       normal: {
//         type: Number,
//         default: 0, // ❗ no free posts anymore
//       },
//       featured: {
//         type: Number,
//         default: 0,
//       },
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Seller", sellerSchema);


const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    shopName: String,
    phone: String,

    logo: { type: String, default: "" },
    location: { type: String, default: "" },

    listingCredits: {
      normal: { type: Number, default: 0 },
      featured: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);