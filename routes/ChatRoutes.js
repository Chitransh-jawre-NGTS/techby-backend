const express = require("express");
const router = express.Router();

const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/ChatController");
const userMiddleware = require("../middleware/userMiddleware");



router.post("/create", userMiddleware, createConversation);
router.get("/conversations", userMiddleware, getConversations);
router.get("/messages/:id", userMiddleware, getMessages);
router.post("/message", userMiddleware, sendMessage);

module.exports = router;