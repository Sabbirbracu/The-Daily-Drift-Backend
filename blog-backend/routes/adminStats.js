const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const { connectDB, closeDB } = require("../db");

// GET /api/admin/stats/overview
router.get("/overview", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);

    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const suspendedUsers = await User.countDocuments({ role: "suspended" });

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      suspendedUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

// GET /api/admin/stats/user-growth
router.get("/user-growth", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);

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
  } finally {
    closeDB();
  }
});

// GET /api/admin/stats/role-distribution
router.get("/role-distribution", auth(["admin"]), async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);

    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const data = {};
    roleCounts.forEach((r) => {
      data[r._id] = r.count;
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    closeDB();
  }
});

module.exports = router;
