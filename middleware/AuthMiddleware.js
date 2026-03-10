// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// const sellerAuth = (req, res, next) => {
//   const token = req.cookies?.sellerToken || req.headers.authorization?.split(' ')[1]; // ✅ Check both cookie and header

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Attach seller info to request
//     req.seller = decoded;

//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = sellerAuth;
// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");
const seller = require("../models/seller");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const sellerAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const seller = await Seller.findById(decoded.id).select("-password");
    if (!seller) return res.status(401).json({ message: "Seller not found" });

    req.seller = seller; // attach seller to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = sellerAuth;