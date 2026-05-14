const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const cron = require('node-cron');
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");



// ✅ Connect Database
dotenv.config();
connectDB();



const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS
const allowedOrigins = [
  "http://localhost:5175",
  "https://glittering-banoffee-98234c.netlify.app",
  "https://techby.in"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-store-token"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

// Routes
const authRoutes = require('./routes/AuthRoutes');
const productRoutes = require('./routes/ProductRoutes');
const codeRoutes = require("./routes/codeRoutes");
const OrdersRoutes = require("./routes/orders");
const listingRoutes = require("./routes/listingRoutes");
const productStatsRoutes = require("./routes/productStatsRoutes"); 
const userRoutes = require("./routes/UserRoutes");

app.use("/api/product-stats", productStatsRoutes);

app.use("/api/listing", listingRoutes);

app.use("/api/order", OrdersRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/user", userRoutes);


// Health check
app.get('/', (req, res) => res.send('Server running 🚀'));

// CRON
cron.schedule("0 0 * * *", () => console.log("🕒 Daily cron job executed"));



// Server
const PORT = process.env.PORT;

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});