// const Product = require("../models/Product");
// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");



// // ---------------- GET PRODUCT BY ID WITH SELLER DETAILS ----------------
// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate(
//       "sellerId",
//       "shopName ",
//     );

//     if (!product) return res.status(404).json({ message: "Product not found" });

//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// // ---------------- GET ALL PRODUCTS WITH SELLER DETAILS ----------------
// const getAllProducts = async (req, res) => {
//   try {
//     // Populate seller info (shopName, logo)
//     const products = await Product.find().populate("sellerId", "shopName logo");
//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- GET PRODUCTS OF LOGGED-IN SELLER WITH DETAILS ----------------
// const getSellerProducts = async (req, res) => {
//   try {
//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const products = await Product.find({ sellerId: req.seller.id }).populate(
//       "sellerId",
//       "shopName logo"
//     );
//     res.status(200).json(products);

//   } catch (err) {
//     console.error("Error fetching seller products:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };


// const createProduct = async (req, res) => {
//   try {
//     const { name, desc, category, totalPrice, discountPrice, featured, deliveryAvailable, ...rest } = req.body;

//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const sellerId = req.seller.id;

//     // ✅ Check how many products the seller uploaded today
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const todayCount = await Product.countDocuments({
//       sellerId,
//       createdAt: { $gte: startOfDay, $lte: endOfDay },
//     });

//     if (todayCount >= 5) {
//       return res.status(403).json({ message: "You can only upload 5 products per day. Try again tomorrow." });
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
//       sellerId,
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

// // ---------------- UPDATE PRODUCT ----------------
// const updateProduct = async (req, res) => {
//   try {
//     const { name, desc, category, totalPrice, discountPrice, featured, deliveryAvailable, ...rest } = req.body;

//     const updateData = {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       attributes: { ...rest },
//     };

//     // Handle multiple new images
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

//       updateData.imageUrls = await Promise.all(uploadPromises);
//     }

//     const product = await Product.findOneAndUpdate(
//       { _id: req.params.id, sellerId: req.seller.id },
//       updateData,
//       { new: true }
//     );

//     if (!product)
//       return res.status(404).json({ message: "Product not found or unauthorized" });

//     res.status(200).json(product);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- DELETE PRODUCT ----------------
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findOne({ _id: req.params.id, sellerId: req.seller.id });
//     if (!product)
//       return res.status(404).json({ message: "Product not found or unauthorized" });

//     await product.deleteOne();
//     res.status(200).json({ message: "Product deleted successfully" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// module.exports = {
//   getAllProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   getSellerProducts,
// };























// const sharp = require("sharp");
// const Product = require("../models/Product");
// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// // ---------------- GET PRODUCT BY ID ----------------
// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("sellerId", "name shopName email phone logo location");

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- GET ALL PRODUCTS ----------------
// const getAllProducts = async (req, res) => {
//   try {
//    const products = await Product.find().populate("sellerId");
//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- GET SELLER PRODUCTS ----------------
// const getSellerProducts = async (req, res) => {
//   try {
//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const products = await Product.find({
//       sellerId: req.seller.id,
//     }).populate("sellerId", "shopName logo");

//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- CREATE PRODUCT ----------------
// // const createProduct = async (req, res) => {
// //   try {
// //     const {
// //       name,
// //       desc,
// //       category,
// //       totalPrice,
// //       discountPrice,
// //       featured,
// //       deliveryAvailable,
// //       ...rest
// //     } = req.body;

// //     if (!req.seller || !req.seller.id) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const sellerId = req.seller.id;

// //     // ✅ Expiry (45 days)
// //     const expiresAt = new Date();
// //     expiresAt.setDate(expiresAt.getDate() + 45);

// //     // ✅ Daily upload limit
// //     const startOfDay = new Date();
// //     startOfDay.setHours(0, 0, 0, 0);

// //     const endOfDay = new Date();
// //     endOfDay.setHours(23, 59, 59, 999);

// //     const todayCount = await Product.countDocuments({
// //       sellerId,
// //       createdAt: { $gte: startOfDay, $lte: endOfDay },
// //     });

// //     if (todayCount >= 10) {
// //       return res.status(403).json({
// //         message: "You can only upload 10 products per day.",
// //       });
// //     }

// //     // ✅ Upload images
// //     let imageUrls = [];

// //     if (req.files && req.files.length > 0) {
// //       const uploadPromises = req.files.map((file) => {
// //         return new Promise((resolve, reject) => {
// //           const stream = cloudinary.uploader.upload_stream(
// //             { folder: "products" },
// //             (error, result) => {
// //               if (error) return reject(error);

// //               resolve({
// //                 url: result.secure_url,
// //                 public_id: result.public_id,
// //               });
// //             }
// //           );

// //           streamifier.createReadStream(file.buffer).pipe(stream);
// //         });
// //       });

// //       imageUrls = await Promise.all(uploadPromises);
// //     }

// //     const attributes = { ...rest };

// //     const newProduct = new Product({
// //       name,
// //       desc,
// //       category,
// //       totalPrice,
// //       discountPrice,
// //       featured: featured || false,
// //       deliveryAvailable: deliveryAvailable || false,
// //       sellerId,
// //       imageUrls,
// //       attributes,
// //       expiresAt,
// //     });

// //     await newProduct.save();

// //     res.status(201).json(newProduct);
// //   } catch (err) {
// //     console.error("Create product error:", err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };


// const createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       ...rest
//     } = req.body;

//     // ================= AUTH CHECK =================
//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const sellerId = req.seller.id;

//     // ================= MONTHLY LIMIT (20 PRODUCTS) =================
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const endOfMonth = new Date();
//     endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//     endOfMonth.setDate(0);
//     endOfMonth.setHours(23, 59, 59, 999);

//     const monthlyCount = await Product.countDocuments({
//       sellerId,
//       createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     if (monthlyCount >= 20) {
//       return res.status(403).json({
//         message: "You can only upload 20 products per month.",
//       });
//     }

//     // ================= EXPIRY (45 DAYS) =================
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 45);

//     // ================= IMAGE UPLOAD =================
//     let imageUrls = [];

//     if (req.files && req.files.length > 0) {
//       const uploadPromises = req.files.map(async (file) => {
//         try {
//           const compressedBuffer = await sharp(file.buffer)
//             .resize({
//               width: 1400,
//               withoutEnlargement: true,
//             })
//             .jpeg({
//               quality: 92,
//               mozjpeg: true,
//             })
//             .toBuffer();

//           return new Promise((resolve, reject) => {
//             const stream = cloudinary.uploader.upload_stream(
//               { folder: "products" },
//               (error, result) => {
//                 if (error) return reject(error);

//                 resolve({
//                   url: result.secure_url,
//                   public_id: result.public_id,
//                 });
//               }
//             );

//             streamifier.createReadStream(compressedBuffer).pipe(stream);
//           });
//         } catch (err) {
//           console.error("Image processing error:", err);
//           throw err;
//         }
//       });

//       imageUrls = await Promise.all(uploadPromises);
//     }

//     // ================= ATTRIBUTES =================
//     const attributes = { ...rest };

//     // ================= SAVE PRODUCT =================
//     const newProduct = new Product({
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured: featured || false,
//       deliveryAvailable: deliveryAvailable || false,
//       sellerId,
//       imageUrls,
//       attributes,
//       expiresAt,
//     });

//     await newProduct.save();

//     return res.status(201).json(newProduct);
//   } catch (err) {
//     console.error("Create product error:", err);
//     return res.status(500).json({ message: err.message });
//   }
// };

// module.exports = { createProduct };
// // ---------------- UPDATE PRODUCT ----------------
// const updateProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       ...rest
//     } = req.body;

//     let updateData = {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       attributes: { ...rest },
//     };

//     // ✅ Upload new images (optional)
//     if (req.files && req.files.length > 0) {
//       const uploadPromises = req.files.map((file) => {
//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (error, result) => {
//               if (error) return reject(error);

//               resolve({
//                 url: result.secure_url,
//                 public_id: result.public_id,
//               });
//             }
//           );

//           streamifier.createReadStream(file.buffer).pipe(stream);
//         });
//       });

//       updateData.imageUrls = await Promise.all(uploadPromises);
//     }

//     const product = await Product.findOneAndUpdate(
//       { _id: req.params.id, sellerId: req.seller.id },
//       updateData,
//       { new: true }
//     );

//     if (!product)
//       return res.status(404).json({ message: "Not found or unauthorized" });

//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ---------------- DELETE PRODUCT ----------------
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findOne({
//       _id: req.params.id,
//       sellerId: req.seller.id,
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // ✅ SAFETY CHECK
//     if (product.imageUrls && product.imageUrls.length > 0) {
//       const deletePromises = product.imageUrls.map((img) => {
//         if (img.public_id) {
//           return cloudinary.uploader.destroy(img.public_id);
//         }
//       });

//       // ✅ Delete all images in parallel
//       await Promise.all(deletePromises);
//     }

//     // ✅ Delete product from DB
//     await product.deleteOne();

//     res.status(200).json({
//       message: "Product and images deleted successfully",
//     });
//   } catch (err) {
//     console.error("Delete product error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
// const getSellerProductLimit = async (req, res) => {
//   try {
//     const sellerId = req.seller.id;

//     // ================= MONTHLY LIMIT =================
//     const limit = 20;

//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const endOfMonth = new Date();
//     endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//     endOfMonth.setDate(0);
//     endOfMonth.setHours(23, 59, 59, 999);

//     const used = await Product.countDocuments({
//       sellerId,
//       createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     res.json({
//       limit,
//       used,
//       remaining: Math.max(limit - used, 0),
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// module.exports = {
//   getAllProducts,
//   getProductById,
//   getSellerProducts,
//   createProduct,
//   updateProduct,
//   getSellerProductLimit,
//   deleteProduct,
// };








// const sharp = require("sharp");
// const Product = require("../models/Product");
// const Seller = require("../models/seller");
// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// // ================= GET PRODUCT BY ID =================
// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("sellerId", "name shopName email phone logo location");

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= GET ALL PRODUCTS =================
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find().populate("sellerId");
//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= GET SELLER PRODUCTS =================
// const getSellerProducts = async (req, res) => {
//   try {
//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const products = await Product.find({
//       sellerId: req.seller.id,
//     }).populate("sellerId", "shopName logo");

//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= CREATE PRODUCT =================
// const createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       ...rest
//     } = req.body;

//     // ================= AUTH CHECK =================
//     if (!req.seller || !req.seller.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const sellerId = req.seller.id;

//     // ================= CHECK SELLER =================
//     const seller = await Seller.findById(sellerId);

//     if (!seller) {
//       return res.status(404).json({ message: "Seller not found" });
//     }

//     // ================= FREE LIMIT (FIXED) =================
//     const FREE_LIMIT = 5; // ✅ FIXED (was 6 inconsistent)

//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const endOfMonth = new Date();
//     endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//     endOfMonth.setDate(0);
//     endOfMonth.setHours(23, 59, 59, 999);

//     const monthlyCount = await Product.countDocuments({
//       sellerId,
//       createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     let isPaid = false;

//     // ================= CREDIT SYSTEM (SAFE ATOMIC UPDATE) =================
//     if (monthlyCount >= FREE_LIMIT) {

//       const field = featured
//         ? "listingCredits.featured"
//         : "listingCredits.normal";

//       const updatedSeller = await Seller.findOneAndUpdate(
//         {
//           _id: sellerId,
//           [field]: { $gt: 0 },
//         },
//         {
//           $inc: { [field]: -1 },
//         },
//         { new: true }
//       );

//       // ❗ SAFE FAILURE HANDLING
//       if (!updatedSeller) {
//         return res.status(403).json({
//           message: featured
//             ? "No featured credits left. Please purchase."
//             : "No normal listing credits left. Please purchase.",
//         });
//       }

//       isPaid = true;
//     }

//     // ================= EXPIRY =================
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 45);

//     // ================= IMAGE UPLOAD (UNCHANGED) =================
//     let imageUrls = [];

//     if (req.files && req.files.length > 0) {
//       const uploadPromises = req.files.map(async (file) => {
//         const compressedBuffer = await sharp(file.buffer)
//           .resize({ width: 1400, withoutEnlargement: true })
//           .jpeg({ quality: 92, mozjpeg: true })
//           .toBuffer();

//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (error, result) => {
//               if (error) return reject(error);

//               resolve({
//                 url: result.secure_url,
//                 public_id: result.public_id,
//               });
//             }
//           );

//           streamifier.createReadStream(compressedBuffer).pipe(stream);
//         });
//       });

//       imageUrls = await Promise.all(uploadPromises);
//     }

//     // ================= CREATE PRODUCT =================
//     const newProduct = new Product({
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured: featured || false,
//       deliveryAvailable: deliveryAvailable || false,
//       sellerId,
//       imageUrls,
//       attributes: { ...rest },
//       expiresAt,
//       isPaid,
//     });

//     await newProduct.save();

//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       product: newProduct,
//     });

//   } catch (err) {
//     console.error("Create product error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// const getMonthlyUsage = async (sellerId, ProductModel) => {
//   const startOfMonth = new Date();
//   startOfMonth.setDate(1);
//   startOfMonth.setHours(0, 0, 0, 0);

//   const endOfMonth = new Date();
//   endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//   endOfMonth.setDate(0);
//   endOfMonth.setHours(23, 59, 59, 999);

//   const used = await ProductModel.countDocuments({
//     sellerId,
//     createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//   });

//   return used;
// };

// // ================= UPDATE PRODUCT =================
// const updateProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       ...rest
//     } = req.body;

//     let updateData = {
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured,
//       deliveryAvailable,
//       attributes: { ...rest },
//     };

//     if (req.files && req.files.length > 0) {
//       const uploadPromises = req.files.map((file) => {
//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (error, result) => {
//               if (error) return reject(error);

//               resolve({
//                 url: result.secure_url,
//                 public_id: result.public_id,
//               });
//             }
//           );

//           streamifier.createReadStream(file.buffer).pipe(stream);
//         });
//       });

//       updateData.imageUrls = await Promise.all(uploadPromises);
//     }

//     const product = await Product.findOneAndUpdate(
//       { _id: req.params.id, sellerId: req.seller.id },
//       updateData,
//       { new: true }
//     );

//     if (!product) {
//       return res.status(404).json({ message: "Not found or unauthorized" });
//     }

//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= DELETE PRODUCT =================
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findOne({
//       _id: req.params.id,
//       sellerId: req.seller.id,
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (product.imageUrls?.length > 0) {
//       const deletePromises = product.imageUrls.map((img) => {
//         if (img.public_id) {
//           return cloudinary.uploader.destroy(img.public_id);
//         }
//       });

//       await Promise.all(deletePromises);
//     }

//     await product.deleteOne();

//     res.status(200).json({
//       message: "Product and images deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= GET LIMIT + CREDITS =================
// const getSellerProductLimit = async (req, res) => {
//   try {
//     const sellerId = req.seller.id;

//     const seller = await Seller.findById(sellerId);

//     const used = await getMonthlyUsage(sellerId);

//     return res.json({
//       freeLimit: FREE_LIMIT,
//       used,
//       remainingFree: Math.max(FREE_LIMIT - used, 0),
//       paidCredits: seller.listingCredits,
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= EXPORT =================
// module.exports = {
//   getAllProducts,
//   getProductById,
//   getSellerProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   getSellerProductLimit,
// }; 



const sharp = require("sharp");
const Product = require("../models/Product");
const Seller = require("../models/seller");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ================= COMMON UTIL =================
const getMonthlyRange = () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
};

const getMonthlyUsage = async (sellerId) => {
  const { startOfMonth, endOfMonth } = getMonthlyRange();

  return Product.countDocuments({
    sellerId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  });
};

// ================= GET PRODUCT BY ID =================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sellerId", "name shopName email phone logo location");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL PRODUCTS =================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("sellerId");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET SELLER PRODUCTS =================
const getSellerProducts = async (req, res) => {
  try {
    if (!req.seller?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const products = await Product.find({
      sellerId: req.seller.id,
    }).populate("sellerId", "shopName logo");

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE PRODUCT =================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured,
      deliveryAvailable,
      ...rest
    } = req.body;

    // ================= AUTH =================
    if (!req.seller?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.seller.id;

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // ================= BOOLEAN FIX =================
    const isFeatured = featured === true || featured === "true";
    const isDelivery = deliveryAvailable === true || deliveryAvailable === "true";

    // ================= FREE LIMIT =================
    const FREE_LIMIT = 3;
    const used = await getMonthlyUsage(sellerId);

    let isPaid = false;

    // ================= CREDIT SYSTEM (STRICT NO MIXING) =================
    if (used >= FREE_LIMIT) {

      // ❗ STRICT RULE:
      // featured → ONLY featured credits
      // normal → ONLY normal credits

      if (isFeatured) {
        const updatedSeller = await Seller.findOneAndUpdate(
          {
            _id: sellerId,
            "listingCredits.featured": { $gt: 0 }
          },
          {
            $inc: { "listingCredits.featured": -1 }
          },
          { new: true }
        );

        if (!updatedSeller) {
          return res.status(403).json({
            success: false,
            message: "No featured credits left. Please purchase featured plan."
          });
        }

      } else {
        const updatedSeller = await Seller.findOneAndUpdate(
          {
            _id: sellerId,
            "listingCredits.normal": { $gt: 0 }
          },
          {
            $inc: { "listingCredits.normal": -1 }
          },
          { new: true }
        );

        if (!updatedSeller) {
          return res.status(403).json({
            success: false,
            message: "No normal credits left. Please purchase normal plan."
          });
        }
      }

      isPaid = true;
    }

    // ================= IMAGE UPLOAD =================
    let imageUrls = [];

    if (req.files?.length) {
      const uploads = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (err, result) => {
              if (err) return reject(err);

              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      imageUrls = await Promise.all(uploads);
    }

    // ================= CREATE PRODUCT =================
    const product = new Product({
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured: isFeatured,            // FIXED
      deliveryAvailable: isDelivery,  // FIXED
      sellerId,
      imageUrls,
      attributes: { ...rest },
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isPaid,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured,
      deliveryAvailable,
      ...rest
    } = req.body;

    let updateData = {
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured,
      deliveryAvailable,
      attributes: { ...rest },
    };

    if (req.files?.length) {
      const uploads = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (err, result) => {
              if (err) return reject(err);

              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      updateData.imageUrls = await Promise.all(uploads);
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.seller.id },
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Not found or unauthorized" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.seller.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.imageUrls?.length) {
      await Promise.all(
        product.imageUrls.map((img) =>
          img.public_id ? cloudinary.uploader.destroy(img.public_id) : null
        )
      );
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product and images deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= LIMIT API =================
const getSellerProductLimit = async (req, res) => {
  try {
    const sellerId = req.seller.id;

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const FREE_LIMIT = 3;
    const used = await getMonthlyUsage(sellerId);

    res.json({
      freeLimit: FREE_LIMIT,
      used,
      remainingFree: Math.max(FREE_LIMIT - used, 0),
      paidCredits: seller.listingCredits,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= EXPORT =================
module.exports = {
  getAllProducts,
  getProductById,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProductLimit,
};