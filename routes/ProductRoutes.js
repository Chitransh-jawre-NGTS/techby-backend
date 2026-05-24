// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/upload");
// const productController = require("../controllers/ProductController");
// const sellerAuth = require("../middleware/AuthMiddleware");

// // Protected seller routes
// router.get("/seller", sellerAuth, productController.getSellerProducts);
// router.get("/limit", sellerAuth, productController.getSellerProductLimit);

// // Use .array("images", 4) for multiple images
// router.post("/", sellerAuth, upload.array("images", 4), productController.createProduct);
// router.put("/:id", sellerAuth, upload.array("images", 4), productController.updateProduct);
// router.delete("/:id", sellerAuth, productController.deleteProduct);

// // Public routes
// router.get("/", productController.getAllProducts);
// router.get("/:id", productController.getProductById);

// module.exports = router;







const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  getMyProducts,
   updateProduct
} = require("../controllers/ProductController");

const auth = require("../middleware/userMiddleware");
const upload = require("../middleware/upload");

// CREATE
router.post(
  "/create",
  auth,
  upload.array("images"),
  createProduct
);

router.get(
  "/my-products",auth, getMyProducts);

// GET ALL
router.get("/", getProducts);

// GET ONE
router.get("/:id", getProductById);

// DELETE
router.delete("/:id", auth, deleteProduct);
router.put(
  "/update/:id",
  auth,
  upload.array("images", 6),
  updateProduct
);

module.exports = router;