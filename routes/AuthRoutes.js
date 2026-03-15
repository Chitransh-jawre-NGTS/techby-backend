const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const upload = require("../middleware/upload");

const { registerSeller, loginSeller, logoutSeller,getSellerProfile,verifySeller,loginAdmin,getAllSellers,deleteSeller } = require("../controllers/AuthController");
const sellerAuth = require("../middleware/AuthMiddleware");
const adminAuth = require("../middleware/AdminAuth");
// Register seller
router.post("/register", upload.single("logo"), registerSeller);

// Login seller (store JWT in httpOnly cookie)
router.post("/sellers/login", loginSeller);

// Logout seller (clear cookie)
router.post("/sellers/logout", logoutSeller);

router.get("/sellers/profile", sellerAuth , getSellerProfile);

// Verify seller token (used for protected routes)
// Verify Seller
router.get("/sellers/verify", sellerAuth, verifySeller);


router.post("/admin/login", loginAdmin);

// GET /api/admin/sellers
router.get("/admin/sellers", adminAuth, async (req, res, next) => {
  try {
    if (req.seller.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  } catch (err) {
    next(err);
  }
}, getAllSellers);

router.delete("/admin/sellers/:id", adminAuth, async (req, res, next) => {
  try {
    if (req.seller.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  } catch (err) {
    next(err);
  }
}, deleteSeller);


module.exports = router;

