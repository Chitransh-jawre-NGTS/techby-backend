const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");

// ================= CREATE OR GET CONVERSATION =================
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, productId } = req.body;

    // ❌ prevent self chat
    if (!receiverId || userId === receiverId) {
      return res.status(400).json({
        message: "Invalid conversation request",
      });
    }

    // ✅ ensure sorted participants (important fix)
    const participants = [userId, receiverId].sort();

    // ✅ atomic find or create
    let conversation = await Conversation.findOne({
      participants,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        productId: productId || null,
        lastMessage: null,
      });
    }

    return res.json(conversation);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================= GET ALL CONVERSATIONS =================
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "name email phone")
      .lean();

    return res.json(chats);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================= GET MESSAGES =================
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({
      conversationId: id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.json(messages);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text,
        senderId: userId,
        createdAt: new Date(),
      },
      updatedAt: new Date(),
    });

    return res.json(message);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};