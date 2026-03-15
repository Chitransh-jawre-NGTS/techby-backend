const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");



// ---------------- GET PRODUCT BY ID WITH SELLER DETAILS ----------------
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "shopName ",
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ---------------- GET ALL PRODUCTS WITH SELLER DETAILS ----------------
const getAllProducts = async (req, res) => {
  try {
    // Populate seller info (shopName, logo)
    const products = await Product.find().populate("sellerId", "shopName logo");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET PRODUCTS OF LOGGED-IN SELLER WITH DETAILS ----------------
const getSellerProducts = async (req, res) => {
  try {
    if (!req.seller || !req.seller.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const products = await Product.find({ sellerId: req.seller.id }).populate(
      "sellerId",
      "shopName logo"
    );
    res.status(200).json(products);

  } catch (err) {
    console.error("Error fetching seller products:", err.message);
    res.status(500).json({ message: err.message });
  }
};
// ---------------- CREATE PRODUCT ----------------
// const createProduct = async (req, res) => {
//   try {
//     const { name, desc, category, totalPrice, discountPrice, featured, deliveryAvailable, ...rest } = req.body;

//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // Handle multiple images
//     let imageUrls = [];
//     if (req.files && req.files.length > 0) {
//       const uploadPromises = req.files.map(file => {
//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (error, result) => (error ? reject(error) : resolve(result.secure_url))
//           );
//           streamifier.createReadStream(file.buffer).pipe(stream);
//         });
//       });
//       imageUrls = await Promise.all(uploadPromises);
//     }

//     // Collect all dynamic fields into attributes
//     const attributes = { ...rest };

//     const newProduct = new Product({
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured: featured || false,
//       deliveryAvailable: deliveryAvailable || false,
//       sellerId: req.seller.id,
//       imageUrls,
//       attributes,
//     });

//     await newProduct.save();
//     res.status(201).json(newProduct);

//   } catch (err) {
//     console.error("Error creating product:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

const createProduct = async (req, res) => {
  try {
    const { name, desc, category, totalPrice, discountPrice, featured, deliveryAvailable, ...rest } = req.body;

    if (!req.seller || !req.seller.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.seller.id;

    // ✅ Check how many products the seller uploaded today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await Product.countDocuments({
      sellerId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (todayCount >= 5) {
      return res.status(403).json({ message: "You can only upload 5 products per day. Try again tomorrow." });
    }

    // Handle multiple images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    // Collect all dynamic fields into attributes
    const attributes = { ...rest };

    const newProduct = new Product({
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured: featured || false,
      deliveryAvailable: deliveryAvailable || false,
      sellerId,
      imageUrls,
      attributes,
    });

    await newProduct.save();
    res.status(201).json(newProduct);

  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE PRODUCT ----------------
const updateProduct = async (req, res) => {
  try {
    const { name, desc, category, totalPrice, discountPrice, featured, deliveryAvailable, ...rest } = req.body;

    const updateData = {
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured,
      deliveryAvailable,
      attributes: { ...rest },
    };

    // Handle multiple new images
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      updateData.imageUrls = await Promise.all(uploadPromises);
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.seller.id },
      updateData,
      { new: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found or unauthorized" });

    res.status(200).json(product);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE PRODUCT ----------------
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.seller.id });
    if (!product)
      return res.status(404).json({ message: "Product not found or unauthorized" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
};






















// ---------------- GET PRODUCTS OF LOGGED-IN SELLER ----------------
// const getSellerProducts = async (req, res) => {
//   try {
//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const products = await Product.find({ sellerId: req.seller.id });
//     res.status(200).json(products);

//   } catch (err) {
//     console.error("Error fetching seller products:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };
