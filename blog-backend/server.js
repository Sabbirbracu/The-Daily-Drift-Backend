const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const rootRouter = require("./routes/rootRouter");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Defined" : "Undefined");

const app = express();

// Global MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected globally..."))
  .catch((err) => {
    console.error("Global MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.use(express.json());
app.use(cookieParser());

// Allow both local and deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://the-daily-drift-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ General rate limiter: 1000 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

// ✅ Auth-specific rate limiter: stricter for login/registration routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again later.",
});

// Apply general limiter to all API routes
app.use("/api", generalLimiter);

// Example: apply stricter limiter to auth routes (adjust as needed)
app.use("/api/auth", authLimiter);

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to the Blog Platform API! Use /api endpoints to interact.",
  });
});

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Use rootRouter for API routes
rootRouter(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
