const ProductStats = require("../models/ProductStats");
const Product = require("../models/Product");

// Increase view
const increaseProductView = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select("sellerId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await ProductStats.findOneAndUpdate(
      { productId },
      {
        $inc: { views: 1 },
        $set: { sellerId: product.sellerId },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      views: updated.views,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller analytics
const getSellerAnalytics = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const data = await ProductStats.find({ sellerId })
      .populate("productId", "name price images");

    const totalViews = data.reduce((acc, item) => acc + item.views, 0);

    res.status(200).json({
      success: true,
      totalViews,
      products: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  increaseProductView,
  getSellerAnalytics,
};



// const PlatformStats = require("../models/productStats");

// // increase global views
// const increasePlatformViews = async (req, res) => {
//   try {
//     const stats = await PlatformStats.findOneAndUpdate(
//       {}, // no filter → single document
//       { $inc: { totalViews: 1 } },
//       { upsert: true, new: true }
//     );

//     res.json({
//       success: true,
//       totalViews: stats.totalViews,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // get total views
// const getPlatformViews = async (req, res) => {
//   try {
//     const stats = await PlatformStats.findOne();

//     res.json({
//       totalViews: stats?.totalViews || 0,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {
//   increasePlatformViews,
//   getPlatformViews,
// };