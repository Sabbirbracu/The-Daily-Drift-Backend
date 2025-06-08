const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserProfile = require("../models/userProfile"); // ✅ update the path as needed

const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

// // Register
// router.post("/register", async (req, res) => {
//   try {
//     const { email, password, fullName } = req.body;

//     if (!email || !password || !fullName) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Auto-generate unique display name
//     const baseName = fullName.split(" ")[0].toLowerCase();
//     let displayName = `@${baseName}`;
//     let isTaken = await User.findOne({ displayName });
//     let counter = 1;

//     while (isTaken) {
//       displayName = `@${baseName}${counter}`;
//       isTaken = await User.findOne({ displayName });
//       counter++;
//     }

//     const newUser = new User({ email, password, fullName, displayName });
//     await newUser.save();

//     res.status(201).json({
//       message: "User registered successfully. Please verify your email.",
//       displayName: newUser.displayName,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// Register
// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Auto-generate unique display name
    const baseName = fullName.split(" ")[0].toLowerCase();
    let displayName = `@${baseName}`;
    let isTaken = await User.findOne({ displayName });
    let counter = 1;

    while (isTaken) {
      displayName = `@${baseName}${counter}`;
      isTaken = await User.findOne({ displayName });
      counter++;
    }

    // Create User
    const newUser = new User({ email, password, fullName, displayName });
    await newUser.save();

    // 🔹 Create associated UserProfile
    await UserProfile.create({
      user: newUser._id,
      // Other fields are already covered by defaults in the schema
    });

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

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get new access token
router.get("/access-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res
        .status(401)
        .json({ message: "No refresh token found. Please login again." });

    const user = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Access token created successfully",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not get access token." });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  console.log("Forgot-password route hit", req.body);
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account with that email address found." });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.SMTP_EMAIL,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.fullName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error); // log actual error
    return res
      .status(500)
      .json({ message: error.message || "Something went wrong" });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // console.log("Reset password API hit");
  // console.log("Token:", token);
  // console.log("Password received:", password ? "Yes" : "No");

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("No user found or token expired");
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    user.password = password; // Will be hashed by pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("Password reset successful for user:", user.email);
    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
