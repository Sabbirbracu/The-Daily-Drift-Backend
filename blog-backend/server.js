const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const rootRouter = require("./routes/rootRouter");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cookieParser());

rootRouter(app); 

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Blog Platform API! Use /api endpoints to interact.",
  });
});

// Environment check
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
