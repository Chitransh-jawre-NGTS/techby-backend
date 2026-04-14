const User = require('../models/User');
const Seller = require('../models/seller');
const Admin = require("../models/Admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Compare with env credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        email: process.env.ADMIN_EMAIL
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET SELLER PROFILE ----------------

const getSellerProfile = async (req, res) => {
  // console.log("Decoded seller from token:", req.seller);

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







const registerSeller = async (req, res) => {
  try {

    const { name, email, password, shopName, phone, location } = req.body;

    if (!name || !email || !password || !shopName || !location) {
  return res.status(400).json({ message: "Required fields missing" });
}

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });

    if (existingSeller) {
      return res.status(400).json({
        message: "Seller already exists"
      });
    }
    // Validate location
if (!["Indore", "Seoni", "Chhindwara"].includes(location)) {
  return res.status(400).json({ message: "Invalid location" });
}

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let logoUrl = "";

    // Upload logo if exists
    if (req.file) {

      const logoUpload = await new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          { folder: "seller-logos" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);

      });

      logoUrl = logoUpload;
    }

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      shopName,
      phone,
      logo: logoUrl,
      location,
    });

    await newSeller.save();

    // Remove password before sending response
    const sellerResponse = {
      _id: newSeller._id,
      name: newSeller.name,
      email: newSeller.email,
      shopName: newSeller.shopName,
      phone: newSeller.phone,
      logo: newSeller.logo,
      location: newSeller.location, 
    };

    res.status(201).json({
      message: "Seller registered successfully",
      seller: sellerResponse
    });

  } catch (error) {

    console.error("Seller Registration Error:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};
const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });

    if (!seller) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,  // <-- send token in response instead of cookie
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


// controllers/sellerController.js
 const verifySeller = (req, res) => {
  try {
    res.json({
      sellerId: req.seller.id,
      role: req.seller.role,
      message: "Verified",
    });
  } catch (error) {
    console.error("Seller verification failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- GET ALL SELLERS ----------------
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    await Seller.findByIdAndDelete(id);
    res.json({ message: "Seller deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  registerSeller,
  loginSeller,
  logoutSeller,
  getSellerProfile,
  verifySeller,
  loginAdmin,
  getAllSellers,
  deleteSeller
};



















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



// ---------------- SELLER LOGIN ----------------

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

// controllers/sellerController.js







// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: 'User already exists' });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({ name, email, password: hashedPassword, phone });
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };