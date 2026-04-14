const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const cron = require('node-cron');
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

dotenv.config();


// ✅ Connect Database
connectDB();

dotenv.config();

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
const paymentRoutes = require("./routes/payment");

app.use("/api/payment", paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/code", codeRoutes);


// Health check
app.get('/', (req, res) => res.send('Server running 🚀'));

// CRON
cron.schedule("0 0 * * *", () => console.log("🕒 Daily cron job executed"));



// Server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));