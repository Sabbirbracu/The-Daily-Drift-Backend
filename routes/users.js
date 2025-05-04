const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { closeDB, connectDB } = require("../db");

// Get user profile
router.get("/profile", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Update user profile
router.put("/profile", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const users = await User.find()
      .sort({ reputation: -1 })
      .limit(10)
      .select("name reputation level");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

module.exports = router;
