const express = require("express");
const router = express.Router();

const {
  increaseProductView,
  getSellerAnalytics,
} = require("../controllers/productStatsController");

router.post("/view/:productId", increaseProductView);

router.get("/seller/:sellerId", getSellerAnalytics);

module.exports = router;

// const express = require("express");
// const router = express.Router();

// const {
//   increasePlatformViews,
//   getPlatformViews,
// } = require("../controllers/productStatsController");

// // 🔥 increase global views
// router.post("/view", increasePlatformViews);

// // 📊 get total platform views
// router.get("/view", getPlatformViews);

// module.exports = router;