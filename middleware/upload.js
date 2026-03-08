const multer = require('multer');

// Memory storage, we will upload buffer directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;