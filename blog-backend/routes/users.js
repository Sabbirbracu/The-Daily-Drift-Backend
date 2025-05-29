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
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { ...req.body }, // ✅ spread full updated data
      { new: true }
    ).select("-password");
    res.json(updatedUser);
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

// Top Authors by number of posts
router.get("/top-authors", async (req, res) => {
  try {
    const authors = await User.find({ posts: { $exists: true, $ne: [] } })
      .sort({ posts: -1 }) // not effective on array, so we need to sort manually later
      .select("userName displayName profileImage posts reputation level")
      .lean();

    // Manually sort by number of posts since MongoDB can't sort by array length directly
    const sortedAuthors = authors
      .map((user) => ({
        ...user,
        postCount: user.posts.length,
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10); // Top 10

    res.json(sortedAuthors);
  } catch (error) {
    console.error("Error fetching top authors:", error);
    res.status(500).json({ message: "Failed to fetch top authors" });
  }
});

module.exports = router;
