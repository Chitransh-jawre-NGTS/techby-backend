// // routes/payment.js

// const express = require("express");
// const router = express.Router();
// require("dotenv").config();
// const Order = require("../models/Order");
// const product = require("../models/Product");
// const sellerAuth = require("../middleware/AuthMiddleware");

// router.post("/create-order", async (req, res) => {
//   try {
//     const { productId } = req.body;

//     // ✅ Validate productId
//     if (!productId) {
//       return res.status(400).json({ message: "Product ID is required" });
//     }

//     // ✅ Get product
//     const Product = require("../models/Product");
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // ✅ Prepare dynamic order data
//     const orderData = {
//       ...req.body, // 🔥 TAKE EVERYTHING FROM FRONTEND

//       sellerId: product.sellerId,
//       productId: product._id,
//       productName: product.name,

//       status: "pending",
//     };

//     const newOrder = await Order.create(orderData);

//     return res.status(201).json({
//       message: "Order created successfully",
//       order: newOrder,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// router.get("/seller/orders", sellerAuth, async (req, res) => {
//   try {

//     const sellerId = req.seller._id; // ✅ FIXED

//     const orders = await Order.find({ sellerId })
//       .sort({ createdAt: -1 });

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// // const Order = require("../models/Order");
// // GET ALL ORDERS (Admin)
// router.get("/admin/orders", async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("sellerId", "name email")
//       .sort({ createdAt: -1 });

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// router.put("/admin/order/:id", async (req, res) => {
//   try {
//     const { status } = req.body;

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// module.exports = router;


// routes/payment.js




const express = require("express");
const router = express.Router();
require("dotenv").config();

const Order = require("../models/Order");
const Product = require("../models/Product");

const sellerAuth = require("../middleware/AuthMiddleware");
const adminAuth = require("../middleware/AdminAuth"); // ✅ ADD THIS

// ==============================
// ✅ CREATE ORDER (SECURE + FLEXIBLE)
// ==============================
router.post("/create-order", async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // ✅ Get product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ❌ BLOCK SENSITIVE FIELDS FROM FRONTEND
    const forbiddenFields = ["status", "sellerId", "productName"];

    forbiddenFields.forEach((field) => {
      if (req.body[field]) {
        delete req.body[field];
      }
    });

    // ✅ CREATE ORDER DATA
    const orderData = {
      ...req.body,

      sellerId: product.sellerId,
      productId: product._id,
      productName: product.name,

      status: "pending",
    };

    const newOrder = await Order.create(orderData);

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// ✅ SELLER: GET OWN ORDERS
// ==============================
router.get("/seller/orders", sellerAuth, async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const orders = await Order.find({ sellerId })
      .populate("productId", "name price images") // ✅ better UI data
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// ✅ ADMIN: GET ALL ORDERS
// ==============================
router.get("/admin/orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("sellerId", "name email")
      .populate("productId", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// ✅ ADMIN: UPDATE ORDER STATUS
// ==============================
router.put("/admin/order/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ VALID STATUS LIST
    const validStatus = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// ✅ SELLER: UPDATE OWN ORDER STATUS (Optional)
// ==============================
router.put("/seller/order/:id", sellerAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const sellerId = req.seller._id;

    const order = await Order.findOne({
      _id: req.params.id,
      sellerId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;