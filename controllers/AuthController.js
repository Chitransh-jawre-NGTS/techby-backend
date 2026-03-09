// const User = require('../models/User');
// const Seller = require('../models/seller');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


// // ---------------- SELLER REGISTER ----------------

// // ---------------- GET SELLER PROFILE ----------------

// const getSellerProfile = async (req, res) => {
//   // console.log("Decoded seller from token:", req.seller);

//   try {
//     const seller = await Seller.findById(req.seller.id).select("-password");

//     if (!seller) {
//       return res.status(404).json({ message: "Seller not found" });
//     }

//     res.json(seller);

//   } catch (error) {
//     console.error("Profile error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// const registerSeller = async (req, res) => {
//   try {
//     const { name, email, password, shopName, phone } = req.body;

//     // Check if seller already exists
//     const existingSeller = await Seller.findOne({ email });
//     if (existingSeller) {
//       return res.status(400).json({ message: "Seller already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Handle logo upload if provided
//     let logoUrl = "";
//     if (req.file) { // assuming single file upload named 'file' in form-data
//       const result = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { folder: "seller-logos" },
//           (error, result) => (error ? reject(error) : resolve(result.secure_url))
//         );
//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//       });
//       logoUrl = result;
//     }

//     // Create new seller
//     const newSeller = new Seller({
//       name,
//       email,
//       password: hashedPassword,
//       shopName,
//       phone,
//       logo: logoUrl,
//     });

//     await newSeller.save();

//     res.status(201).json({ message: "Seller registered successfully", seller: newSeller });

//   } catch (err) {
//     console.error("Error registering seller:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };



// // ---------------- SELLER LOGIN ----------------

// const loginSeller = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const seller = await Seller.findOne({ email });

//     if (!seller) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, seller.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: seller._id, role: "seller" },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // ✅ Store token in cookie
//     res.cookie("sellerToken", token, {
//       httpOnly: true,
//       secure: false, // true in production
//       sameSite: "lax",
//       maxAge: 24 * 60 * 60 * 1000
//     });

//     res.json({
//       message: "Login successful",
//       seller: {
//         id: seller._id,
//         name: seller.name,
//         email: seller.email,
//         shopName: seller.shopName
//       }
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// // ---------------- SELLER LOGOUT ----------------

// const logoutSeller = (req, res) => {
//   res.clearCookie("sellerToken");

//   res.json({
//     message: "Seller logged out"
//   });
// };


// // controllers/sellerController.js
//  const verifySeller = (req, res) => {
//   try {
//     res.json({
//       sellerId: req.seller.id,
//       role: req.seller.role,
//       message: "Verified",
//     });
//   } catch (error) {
//     console.error("Seller verification failed:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// module.exports = {
//   registerSeller,
//   loginSeller,
//   logoutSeller,
//   getSellerProfile,
//   verifySeller
// };















const User = require('../models/User');
const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// ---------------- GET SELLER PROFILE ----------------

const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select("-password");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(seller);

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ---------------- SELLER REGISTER ----------------

const registerSeller = async (req, res) => {
  try {
    const { name, email, password, shopName, phone } = req.body;

    const existingSeller = await Seller.findOne({ email });

    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let logoUrl = "";

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "seller-logos" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      logoUrl = result;
    }

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      shopName,
      phone,
      logo: logoUrl,
    });

    await newSeller.save();

    res.status(201).json({
      message: "Seller registered successfully",
      seller: newSeller
    });

  } catch (err) {
    console.error("Error registering seller:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ---------------- SELLER LOGIN ----------------

const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        shopName: seller.shopName
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ---------------- SELLER LOGOUT ----------------

const logoutSeller = (req, res) => {
  res.clearCookie("sellerToken");

  res.json({
    message: "Seller logged out"
  });
};


module.exports = {
  registerSeller,
  loginSeller,
  logoutSeller,
  getSellerProfile
};