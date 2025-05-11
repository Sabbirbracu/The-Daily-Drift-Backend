const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth"); 


// GET /api/admin/stats/overview
router.get("/overview",auth(["admin"]), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    console.log("Total users:", totalUsers);
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const suspendedUsers = await User.countDocuments({ suspended: "true" });

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      suspendedUsers,
    });
  } catch (error) {
    console.error("Error in /overview:", error);
    res.status(500).json({ message: error.message });
  } 
});

// GET /api/admin/stats/user-growth
router.get("/user-growth",auth(["admin"]), async (req, res) => {
  try {
    const last12Months = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    const monthMap = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formatted = last12Months.map((item) => ({
      month: monthMap[item._id - 1],
      count: item.count,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});

// GET /api/admin/stats/role-distribution 
router.get("/role-distribution", auth(["admin"]), async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    const userCount = await User.countDocuments({ role: "user" });
    const suspendedCount = await User.countDocuments({ suspended: true });

    res.json({
      admin: adminCount,
      user: userCount,
      suspended: suspendedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
