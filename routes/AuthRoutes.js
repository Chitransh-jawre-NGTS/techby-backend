const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");

const { registerSeller, loginSeller, logoutSeller,getSellerProfile } = require("../controllers/AuthController");
const sellerAuth = require("../middleware/AuthMiddleware");
// Register seller
router.post("/register", registerSeller);

// Login seller (store JWT in httpOnly cookie)
router.post("/sellers/login", loginSeller);

// Logout seller (clear cookie)
router.post("/sellers/logout", logoutSeller);

router.get("/sellers/profile", sellerAuth , getSellerProfile);

// Verify seller token (used for protected routes)
router.get("/sellers/verify", sellerAuth, (req, res) => {
  res.json({
    sellerId: req.seller.id,
    role: req.seller.role,
    message: "Verified"
  });
});

// Example protected dashboard route
router.get("/dashboard", sellerAuth, (req, res) => {
  console.log("req.seller:", req.seller);
  res.json({ message: `Welcome ${req.seller?.id || "unknown"} to the dashboard` });
});

module.exports = router;