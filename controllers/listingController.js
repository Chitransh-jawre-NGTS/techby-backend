const ListingPurchase = require("../models/ListingPurchase");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const Seller = require("../models/seller");

// ================= CREATE PURCHASE =================
 const createPurchase = async (req, res) => {
  try {
    const { normalCount, featureCount, totalAmount } = req.body;

    if (!req.seller || !req.seller.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Upload screenshot
    let screenshot = {};

    if (req.file) {
      screenshot = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "payments" },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const purchase = new ListingPurchase({
      sellerId: req.seller.id,
      normalCount,
      featureCount,
      totalAmount,
      paymentScreenshot: screenshot,
    });

    await purchase.save();

    res.status(201).json({
      message: "Purchase request submitted for approval",
      purchase,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAllPurchases = async (req, res) => {
  try {
    const purchases = await ListingPurchase.find()
      .populate("sellerId", "name email shopName");

    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const updatePurchaseStatus = async (req, res) => {
    console.log("Updating purchase status:", req.params.id, req.body);
  try {
    const { status, adminNote } = req.body; 
    console.log("Received status:", status, "Admin note:", adminNote);

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const purchase = await ListingPurchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // ✅ Prevent double credit
    if (status === "approved" && purchase.status !== "approved") {
      const seller = await Seller.findById(purchase.sellerId);

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      seller.listingCredits.normal += purchase.normalCount;
      seller.listingCredits.featured += purchase.featureCount;

      await seller.save();
    }

    purchase.status = status;
    purchase.adminNote = adminNote || "";

    await purchase.save();

    res.json({ message: "Status updated", purchase });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  updatePurchaseStatus,
};