const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    console.log("Connected to MongoDB");

    const { email, password, fullName } = req.body;

    // Basic validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Extract first name (lowercased)
    const baseName = fullName.split(" ")[0].toLowerCase();
    let displayName = `@${baseName}`;

    // Check if that displayName is already taken
    let isTaken = await User.findOne({ displayName });
    let counter = 1;

    // Make it unique: @sakib, @sakib1, @sakib2 ...
    while (isTaken) {
      displayName = `@${baseName}${counter}`;
      isTaken = await User.findOne({ displayName });
      counter++;
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      fullName,
      displayName,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      displayName: newUser.displayName,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
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
    res.json({
      token,
      user: { id: user._id, email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
