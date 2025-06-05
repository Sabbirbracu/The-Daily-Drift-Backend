const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");

// Get all comments for a post (with replies and reactions)
router.get("/:postId", async (req, res) => {
  console.log(`[GET] /api/comments/${req.params.postId} - Fetching comments`);
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log("Invalid postId format:", postId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid Post ID" });
    }

    const comments = await Comment.find({
      post: postId,
      parentComment: null,
    })
      .populate("author", "name profileImage")
      .populate({
        path: "reactions.user",
        select: "name profileImage",
      });

    const replies = await Comment.find({
      post: postId,
      parentComment: { $ne: null },
    })
      .populate("author", "name profileImage")
      .populate({
        path: "reactions.user",
        select: "name profileImage",
      });

    console.log(
      `Fetched ${comments.length} top-level comments and ${replies.length} replies`
    );

    res.json({ success: true, comments, replies });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a top-level comment or reply
router.post("/:postId", auth(["admin", "user"]), async (req, res) => {
  try {
    console.log(`POST /api/comments/${req.params.postId} - Create comment`);
    const { content, parentComment } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      console.log("Post not found with ID:", req.params.postId);
      return res.status(404).json({ message: "Post not found" });
    }

    // Validate parentComment ID if provided
    let validParentComment = null;
    if (parentComment) {
      if (mongoose.Types.ObjectId.isValid(parentComment)) {
        const parent = await Comment.findById(parentComment);
        if (parent) {
          validParentComment = parentComment;
        } else {
          console.log("Parent comment ID invalid or not found:", parentComment);
          // We can treat this as top-level comment by setting validParentComment = null
          validParentComment = null;
        }
      } else {
        console.log("Parent comment ID is invalid format:", parentComment);
        validParentComment = null;
      }
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId,
      parentComment: validParentComment, // either valid parent or null
    });

    await comment.save();
    console.log("Saved new comment:", comment);

    // Update analytics count
    const analytic = await Analytic.findOne({ post: post._id });
    if (analytic) {
      analytic.comments += 1;
      await analytic.save();
      console.log("Incremented comment count in analytics");
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({ message: error.message });
  }
});

// Add or update a reaction
router.post("/react/:commentId", auth(["admin", "user"]), async (req, res) => {
  console.log(
    `[POST] /api/comments/react/${req.params.commentId} - Adding/updating reaction`
  );
  try {
    const { type } = req.body;
    const commentId = req.params.commentId;

    console.log("Reaction type:", type);
    console.log("User ID:", req.user.id);

    const allowed = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!allowed.includes(type)) {
      console.log("Invalid reaction type:", type);
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      console.log("Invalid Comment ID format:", commentId);
      return res.status(400).json({ message: "Invalid Comment ID" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log("Comment not found for ID:", commentId);
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove old reaction from same user if exists
    comment.reactions = comment.reactions.filter(
      (r) => r.user.toString() !== req.user.id
    );

    // Add new reaction
    comment.reactions.push({ user: req.user.id, type });
    await comment.save();

    console.log(
      `Reaction ${type} added for comment ${commentId} by user ${req.user.id}`
    );

    res.json({
      success: true,
      message: "Reaction updated",
      reactions: comment.reactions,
    });
  } catch (error) {
    console.error("Error reacting to comment:", error);
    res.status(500).json({ message: error.message });
  }
});

// Soft delete (suspend) a comment
router.delete("/:id", auth(), async (req, res) => {
  console.log(
    `[DELETE] /api/comments/${req.params.id} - Soft delete (suspend) comment`
  );
  try {
    const commentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      console.log("Invalid Comment ID format:", commentId);
      return res.status(400).json({ message: "Invalid Comment ID" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log("Comment not found for ID:", commentId);
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      console.log(
        `Access denied. User ${req.user.id} with role ${req.user.role} tried to suspend comment by ${comment.author}`
      );
      return res.status(403).json({ message: "Access denied" });
    }

    comment.isSuspended = true;
    await comment.save();
    console.log("Comment suspended:", commentId);

    const analytic = await Analytic.findOne({ post: comment.post });
    if (analytic && analytic.comments > 0) {
      analytic.comments -= 1;
      await analytic.save();
      console.log(
        "Analytic comment count decremented, new count:",
        analytic.comments
      );
    } else {
      console.log(
        "No analytic record found or comments already zero for post:",
        comment.post
      );
    }

    res.json({ message: "Comment suspended" });
  } catch (error) {
    console.error("Error suspending comment:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
