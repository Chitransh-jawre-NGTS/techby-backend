// ======================================================
// ROUTES/chatRoutes.js
// ======================================================









const express = require("express");

const router = express.Router();

const userAuth = require("../middleware/userMiddleware");

const chatController = require("../controllers/ChatController");

// CREATE CHAT
router.post(
  "/conversation",
  userAuth,
  chatController.createConversation
);

// GET ALL CHATS
router.get(
  "/conversation",
  userAuth,
  chatController.getConversations
);

// GET ALL MESSAGES
router.get(
  "/messages/:id",
  userAuth,
  chatController.getMessages
);

// SEND MESSAGE
router.post(
  "/message",
  userAuth,
  chatController.sendMessage
);

// MARK READ
router.put(
  "/read",
  userAuth,
  chatController.markAsRead
);

// DELETE MESSAGE
router.delete(
  "/message/:id",
  userAuth,
  chatController.deleteMessage
);

module.exports = router;