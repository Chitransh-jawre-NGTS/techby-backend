const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");

const { registerSeller, loginSeller, logoutSeller,getSellerProfile,verifySeller } = require("../controllers/AuthController");
const sellerAuth = require("../middleware/AuthMiddleware");
// Register seller
router.post("/register", registerSeller);

// Login seller (store JWT in httpOnly cookie)
router.post("/sellers/login", loginSeller);

// Logout seller (clear cookie)
router.post("/sellers/logout", logoutSeller);

router.get("/sellers/profile", sellerAuth , getSellerProfile);

// Verify seller token (used for protected routes)
// Verify Seller
router.get("/sellers/verify", verifySeller);


module.exports = router;

