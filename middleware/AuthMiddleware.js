const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const sellerAuth = (req, res, next) => {
  const token = req.cookies?.sellerToken || req.headers.authorization?.split(' ')[1]; // ✅ Check both cookie and header

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach seller info to request
    req.seller = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = sellerAuth;