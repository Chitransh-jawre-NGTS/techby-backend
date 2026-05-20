const cron = require("node-cron");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    // ================= 1. EXPIRE PRODUCTS =================
    await Product.updateMany(
      {
        status: "active",
        expiresAt: { $lte: now },
      },
      {
        $set: {
          status: "expired",
          lastStatusUpdate: now,
        },
      }
    );

    // ================= 2. DISABLE AFTER 5 DAYS =================
    await Product.updateMany(
      {
        status: "expired",
        deleteAt: { $lte: now },
      },
      {
        $set: {
          status: "disabled",
          lastStatusUpdate: now,
        },
      }
    );

    // ================= 3. AUTO DELETE =================
    const toDelete = await Product.find({
      status: "disabled",
      deleteAt: { $lte: now },
    });

    for (const product of toDelete) {
      // delete images from cloudinary
      for (const img of product.imageUrls) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      await product.deleteOne();
    }

    console.log("🔥 Product lifecycle cron executed");
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});