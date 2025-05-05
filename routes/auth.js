const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { connectDB, closeDB } = require("../db");
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  console.log("Auth routes loaded");
  try {
    await connectDB(process.env.MONGO_URI);
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: "User registered. Please verify email." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ token, user: { id: user._id, email, name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

router.get("/access-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.json({
        message: "no refresh token found! please login again",
      });
    const user = await jwt.verify(refreshToken, process.env.JWT_SECRET);
    const acessToken = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "acess token created successfully", acessToken });
  } catch (error) {
    console.log(error);
    res.json({
      message: "can not get acess token, something went wrong!",
    });
  }
});

// Password Reset (Placeholder)
router.post("/reset-password", async (req, res) => {
  res.json({ message: "Password reset email sent (not implemented)" });
});

module.exports = router;
