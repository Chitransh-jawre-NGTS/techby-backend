// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     firebaseUid: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     name: {
//       type: String,
//       required: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("User", userSchema);




const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },

    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, default: "" },

    coins: { type: Number, default: 0 },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: { type: String, default: null },

    referralRewarded: { type: Boolean, default: false },

    profileImage: { type: String, default: "" },

    city: String,
    state: String,

    isVerified: { type: Boolean, default: false },

    isBlocked: { type: Boolean, default: false },

    lastSeen: { type: Date, default: Date.now },

    hasPostedFirstProduct: { type: Boolean, default: false },

    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);