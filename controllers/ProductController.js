// const sharp = require("sharp");
// const Product = require("../models/Product");
// const Seller = require("../models/seller");
// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// // ================= COMMON UTIL =================
// const getMonthlyRange = () => {
//   const startOfMonth = new Date();
//   startOfMonth.setDate(1);
//   startOfMonth.setHours(0, 0, 0, 0);

//   const endOfMonth = new Date();
//   endOfMonth.setMonth(endOfMonth.getMonth() + 1);
//   endOfMonth.setDate(0);
//   endOfMonth.setHours(23, 59, 59, 999);

//   return { startOfMonth, endOfMonth };
// };

// const getMonthlyUsage = async (sellerId) => {
//   const { startOfMonth, endOfMonth } = getMonthlyRange();

//   return Product.countDocuments({
//     sellerId,
//     createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//   });
// };

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



// // const getAllProducts = async (req, res) => {
// //   try {

// //     // ================= PAGINATION =================
// //     const page = parseInt(req.query.page) || 1;

// //     const limit = parseInt(req.query.limit) || 20;

// //     const skip = (page - 1) * limit;

// //     // ================= FILTERS =================
// //     const category = req.query.category;

// //     const search = req.query.search;

// //     let filter = {};

// //     // CATEGORY FILTER
// //     if (category) {
// //       filter.category = category;
// //     }

// //     // SEARCH FILTER
// //     if (search) {
// //       filter.name = {
// //         $regex: search,
// //         $options: "i",
// //       };
// //     }

// //     // ================= GET PRODUCTS =================
// //     const products = await Product.find(filter)

// //       // ONLY REQUIRED FIELDS
// //       .select(
// //         "name desc category totalPrice discountPrice imageUrls featured deliveryAvailable sellerId createdAt"
// //       )

// //       // POPULATE ONLY NEEDED DATA
// //       .populate(
// //         "sellerId",
// //         "shopName logo location"
// //       )

// //       // NEWEST FIRST
// //       .sort({ createdAt: -1 })

// //       // PAGINATION
// //       .skip(skip)

// //       .limit(limit)

// //       // PERFORMANCE BOOST
// //       .lean();

// //     // ================= TOTAL PRODUCTS =================
// //     const totalProducts =
// //       await Product.countDocuments(filter);

// //     // ================= RESPONSE =================
// //     res.status(200).json({
// //       success: true,

// //       currentPage: page,

// //       totalPages: Math.ceil(
// //         totalProducts / limit
// //       ),

// //       totalProducts,

// //       products,
// //     });

// //   } catch (err) {

// //     console.error(err);

// //     res.status(500).json({
// //       success: false,
// //       message: err.message,
// //     });

// //   }
// // };

// // ================= GET SELLER PRODUCTS =================
// const getSellerProducts = async (req, res) => {
//   try {
//     if (!req.seller?.id) {
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

//     // ================= AUTH =================
//     if (!req.seller?.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const sellerId = req.seller.id;

//     const seller = await Seller.findById(sellerId);

//     if (!seller) {
//       return res.status(404).json({ message: "Seller not found" });
//     }

//     // ================= BOOLEAN FIX =================
//     const isFeatured = featured === true || featured === "true";
//     const isDelivery = deliveryAvailable === true || deliveryAvailable === "true";

//     // ================= FREE LIMIT =================
//     const FREE_LIMIT = 20;
//     const used = await getMonthlyUsage(sellerId);

//     let isPaid = false;

//     // ================= CREDIT SYSTEM (STRICT NO MIXING) =================
//     if (used >= FREE_LIMIT) {

//       // ❗ STRICT RULE:
//       // featured → ONLY featured credits
//       // normal → ONLY normal credits

//       if (isFeatured) {
//         const updatedSeller = await Seller.findOneAndUpdate(
//           {
//             _id: sellerId,
//             "listingCredits.featured": { $gt: 0 }
//           },
//           {
//             $inc: { "listingCredits.featured": -1 }
//           },
//           { new: true }
//         );

//         if (!updatedSeller) {
//           return res.status(403).json({
//             success: false,
//             message: "No featured credits left. Please purchase featured plan."
//           });
//         }

//       } else {
//         const updatedSeller = await Seller.findOneAndUpdate(
//           {
//             _id: sellerId,
//             "listingCredits.normal": { $gt: 0 }
//           },
//           {
//             $inc: { "listingCredits.normal": -1 }
//           },
//           { new: true }
//         );

//         if (!updatedSeller) {
//           return res.status(403).json({
//             success: false,
//             message: "No normal credits left. Please purchase normal plan."
//           });
//         }
//       }

//       isPaid = true;
//     }

//     // ================= IMAGE UPLOAD =================
//     let imageUrls = [];

//     if (req.files?.length) {
//       const uploads = req.files.map((file) => {
//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (err, result) => {
//               if (err) return reject(err);

//               resolve({
//                 url: result.secure_url,
//                 public_id: result.public_id,
//               });
//             }
//           );

//           streamifier.createReadStream(file.buffer).pipe(stream);
//         });
//       });

//       imageUrls = await Promise.all(uploads);
//     }

//     // ================= CREATE PRODUCT =================
//     const product = new Product({
//       name,
//       desc,
//       category,
//       totalPrice,
//       discountPrice,
//       featured: isFeatured,            // FIXED
//       deliveryAvailable: isDelivery,  // FIXED
//       sellerId,
//       imageUrls,
//       attributes: { ...rest },
//       expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
//       isPaid,
//     });

//     await product.save();

//     return res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       product,
//     });

//   } catch (err) {
//     console.error("Create product error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
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

//     if (req.files?.length) {
//       const uploads = req.files.map((file) => {
//         return new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (err, result) => {
//               if (err) return reject(err);

//               resolve({
//                 url: result.secure_url,
//                 public_id: result.public_id,
//               });
//             }
//           );

//           streamifier.createReadStream(file.buffer).pipe(stream);
//         });
//       });

//       updateData.imageUrls = await Promise.all(uploads);
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

//     if (product.imageUrls?.length) {
//       await Promise.all(
//         product.imageUrls.map((img) =>
//           img.public_id ? cloudinary.uploader.destroy(img.public_id) : null
//         )
//       );
//     }

//     await product.deleteOne();

//     res.status(200).json({
//       message: "Product and images deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= LIMIT API =================
// const getSellerProductLimit = async (req, res) => {
//   try {
//     const sellerId = req.seller.id;

//     const seller = await Seller.findById(sellerId);

//     if (!seller) {
//       return res.status(404).json({ message: "Seller not found" });
//     }

//     const FREE_LIMIT = 20;
//     const used = await getMonthlyUsage(sellerId);

//     res.json({
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





















const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const User = require("../models/User");

// ================= CREATE PRODUCT =================
exports.createProduct = async (req, res) => {
  console.log("Creating product with data:", req.body);

  try {
   const {
  name,
  desc,
  category,
  totalPrice,
  discountPrice,
  featured,
  deliveryAvailable,
  city,
  state,
  district,
  country,
  postalCode,
  lat,
  lng,
  ...attributes
} = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ================= FIND USER =================
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= PARSE LOCATION (FIX BUG) =================
    let parsedLocation = {};

    try {
      parsedLocation = location ? JSON.parse(location) : {};
    } catch (err) {
      parsedLocation = {};
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

          require("streamifier")
            .createReadStream(file.buffer)
            .pipe(stream);
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
  featured: featured === "true" || featured === true,
  deliveryAvailable: deliveryAvailable === "true" || deliveryAvailable === true,
  city,
  attributes: {
    ...attributes,
    location: {
      city,
      state,
      district,
      country,
      postalCode,
      lat,
      lng,
    },
  },
  userId: req.user.id,
  imageUrls,
});

    await product.save();

    // ================= FIRST PRODUCT LOGIC =================
    const productCount = await Product.countDocuments({
      userId: req.user.id,
    });

    if (productCount === 1) {
      user.hasPostedFirstProduct = true;

      // ================= OWNER BONUS =================
      user.coins += 10;

      // ================= REFERRAL LOGIC =================
      if (user.referredBy && !user.referralRewarded) {
        const refUser = await User.findOne({
          referralCode: user.referredBy,
        });

        if (refUser) {
          // reward referrer
          refUser.coins += 20;
          await refUser.save();

          user.referralRewarded = true;
        }
      }

      await user.save();
    }

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const products = await Product.find();

    if (!lat || !lng) {
      return res.json({ success: true, products });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // distance function (Haversine formula)
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = (value) => (value * Math.PI) / 180;

      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    };

    const filtered = products.filter((p) => {
      const loc = p.attributes?.location;

      if (!loc) return false;

      const location =
        typeof loc === "string" ? JSON.parse(loc) : loc;

      if (!location?.lat || !location?.lng) return false;

      const distance = getDistance(
        userLat,
        userLng,
        parseFloat(location.lat),
        parseFloat(location.lng)
      );

      return distance <= 100; // 🔥 100 KM radius
    });

    return res.json({
      success: true,
      products: filtered,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    ).populate("userId", "name email phone");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}; 
// ================= DELETE PRODUCT =================
exports.deleteProduct = async (
  req,
  res
) => {
  try {

    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    // ================= CHECK OWNER =================
    if (
      product.userId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    // ================= DELETE CLOUDINARY IMAGES =================
    if (
      product.imageUrls?.length >
      0
    ) {

      for (const image of product.imageUrls) {

        if (image.public_id) {

          await cloudinary.uploader.destroy(
            image.public_id
          );

        }
      }
    }

    // ================= DELETE PRODUCT =================
    await Product.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ================= GET MY PRODUCTS =================
exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({
      userId,
    })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
  // ================= UPDATE PRODUCT =================
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ================= CHECK OWNER =================
    if (
      product.userId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ================= GET DATA =================
    const {
      name,
      desc,
      category,
      totalPrice,
      discountPrice,
      featured,
      deliveryAvailable,
      city,
      state,
      district,
      country,
      postalCode,
      lat,
      lng,
      ...attributes
    } = req.body;

    // ================= IMAGE UPDATE =================
    let imageUrls = product.imageUrls;

    // IF NEW IMAGES PROVIDED
    if (req.files?.length > 0) {

      // DELETE OLD CLOUDINARY IMAGES
      for (const img of product.imageUrls) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(
            img.public_id
          );
        }
      }

      // UPLOAD NEW IMAGES
      const uploads = req.files.map(
        (file) => {
          return new Promise(
            (resolve, reject) => {
              const stream =
                cloudinary.uploader.upload_stream(
                  {
                    folder:
                      "products",
                  },
                  (
                    err,
                    result
                  ) => {
                    if (err)
                      return reject(
                        err
                      );

                    resolve({
                      url: result.secure_url,
                      public_id:
                        result.public_id,
                    });
                  }
                );

              streamifier
                .createReadStream(
                  file.buffer
                )
                .pipe(stream);
            }
          );
        }
      );

      imageUrls =
        await Promise.all(uploads);
    }

    // ================= UPDATE PRODUCT =================
    product.name = name || product.name;

    product.desc = desc || product.desc;

    product.category =
      category || product.category;

    product.totalPrice =
      totalPrice ||
      product.totalPrice;

    product.discountPrice =
      discountPrice ||
      product.discountPrice;

    product.featured =
      featured === "true" ||
      featured === true;

    product.deliveryAvailable =
      deliveryAvailable ===
        "true" ||
      deliveryAvailable === true;

    product.city =
      city || product.city;

    // ================= LOCATION =================
    product.attributes = {
      ...product.attributes,
      ...attributes,

      location: {
        city,
        state,
        district,
        country,
        postalCode,
        lat,
        lng,
      },
    };

    // ================= SAVE IMAGES =================
    product.imageUrls = imageUrls;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
