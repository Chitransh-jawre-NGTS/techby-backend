// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const User = require("../models/User");


// // ================= SIGNUP =================

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     // validation
//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // check existing email
//     const existingEmail = await User.findOne({ email });

//     if (existingEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists",
//       });
//     }

//     // check existing phone
//     const existingPhone = await User.findOne({ phone });

//     if (existingPhone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone already exists",
//       });
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // create user
//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Signup successful",
//       user,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // ================= LOGIN =================

// exports.login = async (req, res) => {
//   try {
//     const { emailOrPhone, password } = req.body;

//     // validation
//     if (!emailOrPhone || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // find user
//     const user = await User.findOne({
//       $or: [
//         { email: emailOrPhone },
//         { phone: emailOrPhone },
//       ],
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // compare password
//     const isMatch = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid password",
//       });
//     }

//     // token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // ================= PROFILE =================

// exports.profile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id)
//       .select("-password");

//     res.status(200).json({
//       success: true,
//       user,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };










const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const firebaseAdmin = require("../config/firebase");

// ================= SAFE USER RESPONSE =================
const safeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    firebaseUid: user.firebaseUid, // remove if not needed on frontend
  };
};

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { firebaseToken, name, email, phone, password } = req.body;

    // VALIDATION
    if (!firebaseToken || !name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // VERIFY FIREBASE TOKEN
    const decodedToken = await firebaseAdmin
      .auth()
      .verifyIdToken(firebaseToken);

    // CHECK EXISTING USER
    const existingUser = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await User.create({
      firebaseUid: decodedToken.uid,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // JWT TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase token required",
      });
    }

    // VERIFY FIREBASE TOKEN
    const decodedToken = await firebaseAdmin
      .auth()
      .verifyIdToken(firebaseToken);

    // FIND USER
    const user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // JWT TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= PROFILE =================
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: safeUser(user),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};