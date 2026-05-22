// ======================================================
// MODELS/ConversationModel.js
// ======================================================

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    lastMessage: {
      text: {
        type: String,
        default: "",
      },

      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },

    unreadCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);