const express = require("express");

const {
  signup,
  login,
  profile,
} = require("../controllers/userController");

const userMiddleware = require("../middleware/userMiddleware");

const router = express.Router();


// routes
router.post("/signup", signup);

router.post("/login", login);

router.get(
  "/profile",
  userMiddleware,
  profile
);


module.exports = router;