const User = require('../models/User');
const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


// ---------------- SELLER REGISTER ----------------

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
    const { name, email, password, shopName, phone } = req.body;

    const existingSeller = await Seller.findOne({ email });

    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      shopName,
      phone
    });

    await newSeller.save();

    res.status(201).json({ message: "Seller registered successfully" });

  } catch (err) {
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

    // ✅ Store token in cookie
    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: "None",
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