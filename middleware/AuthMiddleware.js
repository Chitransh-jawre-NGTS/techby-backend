

const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");


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




// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// const userAuth = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   // CHECK TOKEN
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({
//       message: "No token provided",
//     });
//   }

//   // GET TOKEN
//   const token = authHeader.split(" ")[1];

//   try {
//     // VERIFY TOKEN
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // FIND USER
//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) {
//       return res.status(401).json({
//         message: "User not found",
//       });
//     }

//     // ATTACH USER
//     req.user = user;

//     next();

//   } catch (error) {

//     return res.status(401).json({
//       message: "Invalid or expired token",
//     });

//   }
// };

// module.exports = userAuth;