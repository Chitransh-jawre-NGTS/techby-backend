const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createPurchase,
  getAllPurchases,
  updatePurchaseStatus,
} = require("../controllers/listingController");
const sellerAuth = require("../middleware/AuthMiddleware");
const adminAuth = require("../middleware/AdminAuth");

const upload = multer();

// SELLER
router.post("/purchase",sellerAuth, upload.single("screenshot"), createPurchase);

// ADMIN
router.get("/admin/purchases", getAllPurchases);
router.put("/admin/purchase/:id",adminAuth, updatePurchaseStatus);

module.exports = router;