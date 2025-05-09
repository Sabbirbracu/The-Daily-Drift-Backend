const express = require("express");
const router = express.Router();
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");
const { closeDB, connectDB } = require("../db");
const Post = require("../models/Post");

// Get post analytics
router.get("/post/:postId", auth(), async (req, res) => {
  try {
    
    const analytic = await Analytic.findOne({ post: req.params.postId });
    if (!analytic)
      return res.status(404).json({ message: "Analytics not found" });
    res.json(analytic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});

// Get user engagement metrics
router.get("/user", auth(), async (req, res) => {
  try {
    
    const posts = await Post.find({ author: req.user.id });
    const analytics = await Analytic.find({
      post: { $in: posts.map((p) => p._id) },
    });
    const metrics = {
      totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
      totalComments: analytics.reduce((sum, a) => sum + a.comments, 0),
      totalLikes: analytics.reduce((sum, a) => sum + a.likes, 0),
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});

module.exports = router;
