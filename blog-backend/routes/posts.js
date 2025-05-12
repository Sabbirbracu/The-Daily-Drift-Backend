const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");

// Create a post
router.post("/", auth(["user", "admin"]), async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user.id,
      status: "pending",
    });
    await post.save();
    await Analytic.create({ post: post._id });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get approved posts for Home Page (Public Access)
router.get("/publicPosts", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = { status: "approved" };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const posts = await Post.find(query).populate("author", "name");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posts (dynamic: all, approved, pending, declined)
router.get("/", auth(["admin", "user"]), async (req, res) => {
  try {
    const { search = "", status } = req.query;
    const query = {};

    if (status) {
      query.status = status; // e.g., "pending", "approved", "declined"
    } else if (req.user.role !== "admin") {
      query.status = "approved"; // default for normal users
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const posts = await Post.find(query).populate("author", "name");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posts created by the current user
router.get("/ownPost", auth(["user", "admin"]), async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).populate("author", "name");
    res.json(posts.length ? posts : { message: "No posts found for this user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single post by ID and increment views
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();
    await Analytic.findOneAndUpdate({ post: post._id }, { $inc: { views: 1 } });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like or unlike a post
router.post("/:id/like", auth(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await Analytic.findOneAndUpdate({ post: post._id }, { likes: post.likes.length });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get number of likes on a post
router.get("/:id/likes", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select("likes");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote in a poll on a post
router.post("/:id/poll/:pollId/vote", auth(), async (req, res) => {
  try {
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
  }
});

// Update a post
router.put("/:id", auth(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post
router.delete("/:id", auth(), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Post.deleteOne({ _id: post._id });
    await Analytic.deleteOne({ post: post._id });

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve a post
router.patch("/:id/approve", auth(["admin"]), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Decline a post
router.patch("/:id/decline", auth(["admin"]), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "declined" },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
