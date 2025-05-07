const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const rootRouter = require("./routes/rootRouter");
const cors = require("cors");

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Defined" : "Undefined");

const app = express();

app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
  })
);

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

rootRouter(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
