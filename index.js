const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const chatSocket = require("./socket/chatSocket.js");

// ================= CONFIG =================
dotenv.config();

// ================= DB =================
const connectDB = require("./config/db");
connectDB();

// ================= APP =================
const app = express();

// ================= SECURITY MIDDLEWARE =================
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests, try again later.",
});

app.use(limiter);

// ================= BODY PARSER =================
app.use(express.json());
app.use(cookieParser());

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5175",
  "https://glittering-banoffee-98234c.netlify.app",
  "https://techby.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-store-token"],
  })
);

// ================= CRON JOBS =================
require("./corn/productLifecycleCron");

// (optional fallback log cron)
const cron = require("node-cron");
cron.schedule("0 0 * * *", () => {
  console.log("🕒 Daily server cron heartbeat executed");
});

// ================= ROUTES =================
const authRoutes = require("./routes/AuthRoutes");
const productRoutes = require("./routes/ProductRoutes");
const OrdersRoutes = require("./routes/orders");
const listingRoutes = require("./routes/listingRoutes");
const productStatsRoutes = require("./routes/productStatsRoutes");
const userRoutes = require("./routes/UserRoutes");
const locationRoutes = require("./routes/location");
const chatRoutes = require("./routes/ChatRoutes");

// API PREFIXES
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", OrdersRoutes);
app.use("/api/listing", listingRoutes);
app.use("/api/product-stats", productStatsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/chat", chatRoutes);
// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🚀 Server running successfully");
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// ================= SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// INIT CHAT SOCKET
chatSocket(io);

// ================= START SERVER =================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});