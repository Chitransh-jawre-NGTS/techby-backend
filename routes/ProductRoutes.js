// const express = require("express");
// const router = express.Router();

// const upload = require("../middleware/upload");

// const {
//   getAllProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct
// } = require("../controllers/productController");


// // GET all products
// router.get("/", getAllProducts);


// // GET single product
// router.get("/:id", getProductById);


// // CREATE product
// router.post(
//   "/",
//   upload.single("image"), // field name from frontend
//   createProduct
// );


// // UPDATE product
// router.put(
//   "/:id",
//   upload.single("image"), // allows updating image
//   updateProduct
// );


// // DELETE product
// router.delete("/:id", deleteProduct);


// module.exports = router; 

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const productController = require("../controllers/ProductController");
const sellerAuth = require("../middleware/AuthMiddleware");

// Protected seller routes
router.get("/seller", sellerAuth, productController.getSellerProducts);
router.get("/limit", sellerAuth, productController.getSellerProductLimit);

// Use .array("images", 4) for multiple images
router.post("/", sellerAuth, upload.array("images", 4), productController.createProduct);
router.put("/:id", sellerAuth, upload.array("images", 4), productController.updateProduct);
router.delete("/:id", sellerAuth, productController.deleteProduct);

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

module.exports = router;