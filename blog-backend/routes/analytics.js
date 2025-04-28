const express = require("express");
const router = express.Router();
const Analytic = require("../models/Analytic");
const auth = require("../middleware/auth");
const { closeDB, connectDB } = require("../db");

// Get post analytics
router.get("/post/:postId", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    const analytic = await Analytic.findOne({ post: req.params.postId });
    if (!analytic)
      return res.status(404).json({ message: "Analytics not found" });
    res.json(analytic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// Get user engagement metrics
router.get("/user", auth(), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
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
  } finally {
    closeDB();
  }
});

module.exports = router;
