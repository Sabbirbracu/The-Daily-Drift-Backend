const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");
const { connectDB, closeDB } = require("../db");
const mongoose = require("mongoose");

// Create a post
router.post("/", auth(["user", "admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const post = new Post({ ...req.body, author: req.user.id });
    await post.save();
    await Analytic.create({ post: post._id });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Get all postsp
router.get("/", async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const { search } = req.query;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};
    const posts = await Post.find(query).populate("author", "name");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});
// Get all posts by a specific user
router.get("/ownPost", auth(["user", "admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);

    const userId = req.user.id;
    const posts = await Post.find({ author: userId }).populate(
      "author",
      "name"
    );

    if (posts.length === 0) {
      return res.json({ message: "No posts found for this user" });
    }

    res.json(posts);
  } catch (error) {
    console.error("Error in /ownPost:", error);
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Get a single post
router.get("/:id", async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.views += 1;
    await post.save();
    await Analytic.findOneAndUpdate({ post: post._id }, { $inc: { views: 1 } });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Like a post
router.post("/:id/like", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    await Analytic.findOneAndUpdate(
      { post: post._id },
      { likes: post.likes.length }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Vote in a poll
router.post("/:id/poll/:pollId/vote", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const poll = post.polls.id(req.params.pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    poll.options[optionIndex].votes += 1;
    await post.save();
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Update a post
router.put("/:id", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Delete a post
router.delete("/:id", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    await post.remove();
    await Analytic.deleteOne({ post: post._id });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

module.exports = router;
