const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");
const User = require("../models/User"); // adjust path if needed

// Create a post
router.post("/", auth(["user", "admin"]), async (req, res) => {
  try {
    // Create new post from request body and set author and default status
    const post = new Post({
      ...req.body,
      author: req.user.id,
      status: "pending",
    });
    await post.save();

    // Create initial analytics record for this post
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

    // Case-insensitive search on post title if search term provided
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Populate author displayName and profileImage for frontend display
    const posts = await Post.find(query).populate(
      "author",
      "displayName profileImage"
    );

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posts (dynamic filtering based on status and user role)
router.get("/", auth(["admin", "user"]), async (req, res) => {
  try {
    const { search = "", status } = req.query;
    const query = {};

    // If status specified, filter by it; otherwise normal users get only approved posts
    if (status) {
      query.status = status; // e.g., "pending", "approved", "declined"
    } else if (req.user.role !== "admin") {
      query.status = "approved";
    }

    // Search by title if search term provided
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const posts = await Post.find(query).populate(
      "author",
      "displayName profileImage"
    );

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posts created by the current user
router.get("/ownPost", auth(["user", "admin"]), async (req, res) => {
  try {
    // Query posts with author equal to current user id
    const posts = await Post.find({ author: req.user.id }).populate(
      "author",
      "displayName profileImage"
    );
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single post by ID and increment views
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "displayName profileImage"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Increment views count and save
    post.views += 1;
    await post.save();

    // Update Analytic document views count (increment by 1)
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
    // Toggle like status for the user
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // Sync likes count in analytics collection
    await Analytic.findOneAndUpdate(
      { post: post._id },
      { likes: post.likes.length }
    );

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

    // Validate optionIndex existence to avoid runtime error
    if (
      optionIndex === undefined ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    poll.options[optionIndex].votes += 1;
    await post.save();
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a post
// PUT /api/posts/:id
router.put("/:id", auth(["admin", "user"]), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatableFields = [
      "title",
      "metaTitle",
      "metaDescription",
      "tags",
      "content",
      "category",
      "image",
      "polls",
      "status", // ✅ allow changing status in admin/editor dashboard
    ];

    // Clean update object
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Post update error:", error);
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

    // Only author or admin can delete
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Remove post reference from user's posts array (if you have this array)
    // NOTE: Your User model does not currently have a posts array, so this might do nothing
    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: post._id },
    });

    // Delete the post and associated analytics
    await Post.deleteOne({ _id: post._id });
    await Analytic.deleteOne({ post: post._id });

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve a post (Admin only)
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

// Decline a post (Admin only)
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
