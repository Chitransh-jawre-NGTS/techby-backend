const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/AuthMiddleware"); // optional if generating price pool needs login
const {
  generateVerificationCode,
  verifyCode,
  generatePricePool
} = require("../controllers/CodeController");

// Save / generate a verification code
router.post("/generate-code", generateVerificationCode);

// Verify a code
router.post("/verify-code", verifyCode);

// Generate a price pool code (after verification / login)
router.post("/generate-price-pool", authMiddleware, generatePricePool);

module.exports = router;