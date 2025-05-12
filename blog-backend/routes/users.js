const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get user profile
router.get("/profile", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", auth(), async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...req.body },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ reputation: -1 })
      .limit(10)
      .select("name reputation level");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
