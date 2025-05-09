const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");

// Create a comment
router.post("/:postId", auth(), async (req, res) => {
  try {
    
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId,
    });
    await comment.save();
    const analytic = await Analytic.findOne({ post: post._id });
    if (analytic) {
      analytic.comments += 1;
      await analytic.save();
    }
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } 
});

// Delete a comment
router.delete("/:id", auth(), async (req, res) => {
  try {
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    await comment.remove();
    const analytic = await Analytic.findOne({ post: comment.post });
    if (analytic) {
      analytic.comments -= 1;
      await analytic.save();
    }
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});
module.exports = router;
