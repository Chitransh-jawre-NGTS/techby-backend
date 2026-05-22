const jwt = require("jsonwebtoken");
const User = require("../models/User");
const firebaseAdmin = require("../config/firebase");

// ================= SAFE USER =================
const safeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    coins: user.coins,
    referralCode: user.referralCode,
    referredBy: user.referredBy,
  };
};

// ================= JWT =================
function generateReferralCode(name) {
  return (
    name
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") +
    Date.now().toString().slice(-4) +
    Math.random().toString(36).substring(2, 4).toUpperCase()
  );
}


function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { firebaseToken, name, email, phone, referralCode } = req.body;

    const decoded = await firebaseAdmin.auth().verifyIdToken(firebaseToken);

    let existing = await User.findOne({ firebaseUid: decoded.uid });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // find referrer
    let refUser = null;
    if (referralCode) {
      refUser = await User.findOne({ referralCode });

      if (!refUser) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    const user = await User.create({
      firebaseUid: decoded.uid,
      name,
      email,
      phone,
      referralCode: generateReferralCode(name),
      referredBy: referralCode || null,
    });

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

    // VERIFY TOKEN
    const decoded = await firebaseAdmin.auth().verifyIdToken(firebaseToken);

    // FIND USER
    let user = await User.findOne({ firebaseUid: decoded.uid });

    // AUTO CREATE USER (safe)
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
        phone: decoded.phone_number || "",
        coins: 0,
        referralCode: generateReferralCode(decoded.email || "USER"),
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
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

// ================= PROFILE =================
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// ================= REFERRAL CODE GENERATOR =================
function generateReferralCode(input) {
  return (
    input
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}










// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const firebaseAdmin = require("../config/firebase");

// // ================= SAFE USER =================
// const safeUser = (user) => ({
//   id: user._id,
//   name: user.name,
//   email: user.email,
//   phone: user.phone,
//   profileImage: user.profileImage,
//   authProvider: user.authProvider,
// });

// // ================= JWT =================
// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user._id,
//       email: user.email,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// }; 
// exports.signup = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, password required",
//       });
//     }

//     const existing = await User.findOne({ email });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       phone: phone || null,
//       password: hashedPassword,
//       authProvider: "local",
//     });

//     const token = generateToken(user);

//     return res.status(201).json({
//       success: true,
//       token,
//       user: safeUser(user),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }; 
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password required",
//       });
//     }

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = generateToken(user);

//     return res.status(200).json({
//       success: true,
//       token,
//       user: safeUser(user),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message, 
//     });
//   }
// };


// exports.googleLogin = async (req, res) => {
//   try {
//     const { firebaseToken } = req.body;

//     if (!firebaseToken) {
//       return res.status(400).json({
//         success: false,
//         message: "Firebase token required",
//       });
//     }

//     const decoded = await firebaseAdmin
//       .auth()
//       .verifyIdToken(firebaseToken);

//     let user = await User.findOne({ email: decoded.email });

//     if (!user) {
//       user = await User.create({
//         firebaseUid: decoded.uid,
//         name: decoded.name || "Google User",
//         email: decoded.email,
//         profileImage: decoded.picture || "",
//         authProvider: "google",
//       });
//     } else {
//       // ensure firebaseUid is linked
//       if (!user.firebaseUid) {
//         user.firebaseUid = decoded.uid;
//         user.authProvider = "google";
//         await user.save();
//       }
//     }

//     const token = generateToken(user);

//     return res.status(200).json({
//       success: true,
//       token,
//       user: safeUser(user),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// }; 
