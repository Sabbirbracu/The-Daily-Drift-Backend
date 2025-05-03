const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const { closeDB, connectDB } = require("../db");

// Suspend a user
router.put("/users/:id/suspend", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "suspended" },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Verify a user
router.put("/users/:id/verify", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Suspend a post
router.put("/posts/:id/suspend", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Suspend a comment
router.put("/comments/:id/suspend", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

module.exports = router;
