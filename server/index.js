const dotenv = require("dotenv");
dotenv.config();

console.log("SERVER BOOTING - VERSION 3.4.0 - RECHARGE DEBUG");

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { runDailyROI } = require("./src/services/roiService");

const connectDB = require("./src/config/db");
const routes = require("./src/routes");

const app = express();

/* =======================
   MIDDLEWARES
======================= */
app.use((req, res, next) => {
  console.log(`[V3.4.0 LOG] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// CRITICAL FIX: Skip body parsing for multipart/form-data
// Let multer handle it instead
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    console.log("Skipping body parser for multipart request");
    return next(); // Skip to next middleware without parsing
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// CORS configuration - allow both production and development
const allowedOrigins = [
  process.env.CLIENT_URL,   // Production domain (later)
  'http://localhost:5173',  // Vite dev
  'http://localhost:4173',  // Vite preview (IMPORTANT)
  'http://localhost:3000',  // Backend same-origin
];


app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

/* =======================
   DATABASE
======================= */
connectDB();

/* =======================
   ROUTES
======================= */
app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", version: "3.4.0", message: "TradeIndia backend is running" });
});

/* =======================
   DAILY ROI CRON JOB
======================= */
cron.schedule("0 0 * * *", async () => {
  await runDailyROI();
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
