const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Admin token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Only admin allowed" });
    }

    req.admin = decoded; // attach decoded info
    next();
  } catch (err) {
    console.error("Admin Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};

module.exports = adminAuth;