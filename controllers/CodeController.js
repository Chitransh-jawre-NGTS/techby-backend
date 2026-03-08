const VerificationCode = require("../models/verification");
const PricePool = require("../models/PricePool");

// ------------------- Save / Generate Verification Code -------------------
const generateVerificationCode = async (req, res) => {
  try {
    const { code, sellerId } = req.body;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days validity

    const newCode = new VerificationCode({
      code,
      sellerId,
      expiresAt,
    });

    await newCode.save();

    res.json({
      success: true,
      message: "Verification code stored successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Verify Code -------------------
const verifyCode = async (req, res) => {
  try {
    const { code } = req.body;

    // Find the code
    const validCode = await VerificationCode.findOne({
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // ✅ Delete the code after successful verification
    await VerificationCode.deleteOne({ _id: validCode._id });

    res.json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Generate Price Pool Code -------------------
const generatePricePool = async (req, res) => {
  try {
    // Generate random 8-character alphanumeric code
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const pricePool = new PricePool({
      code: newCode,
      createdBy: req.user?.id || null, // user/seller ID if available
    });

    await pricePool.save();

    res.status(201).json({ message: "Price pool code generated", code: newCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate price pool code" });
  }
};

module.exports = {
  generateVerificationCode,
  verifyCode,
  generatePricePool,
};