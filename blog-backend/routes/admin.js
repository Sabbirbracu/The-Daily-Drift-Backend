const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

// Verify a user
router.put("/users/:id/verify", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Suspend a post
router.put("/posts/:id/suspend", auth(["admin"]), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Suspend a comment
router.put("/comments/:id/suspend", auth(["admin"]), async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users
router.get("/users", auth(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id/make-admin
router.put("/users/:id/make-admin", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User promoted to admin", user });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/:id/make-user
router.put("/users/:id/make-user", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "user" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User demoted to regular user", user });
  } catch (error) {
    console.error("Error demoting user to regular user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Unsuspend a post
router.put("/posts/:id/unsuspend", auth(["admin"]), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Suspend a user
router.put("/users/:id/suspend", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { suspended: true }, // only update suspended field, not role
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unsuspend a user (make them a regular user again)
router.put("/users/:id/unsuspend", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { suspended: false }, // only update suspended field, not role
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;
