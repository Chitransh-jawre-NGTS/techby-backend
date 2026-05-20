const Message = require("../models/MessageModel");
const Conversation = require("../models/ConversationModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join_chat", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("send_message", async (data) => {
      const { conversationId, senderId, text } = data;

      const message = await Message.create({
        conversationId,
        senderId,
        text,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text,
          senderId,
          createdAt: new Date(),
        },
      });

      io.to(conversationId).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};