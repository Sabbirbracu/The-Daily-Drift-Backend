const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserProfile = require("../models/userProfile");
const auth = require("../middleware/auth");

// 🔹 Get current user profile (base + extended)
router.get("/profile", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await UserProfile.findOne({ user: req.user.id });
    res.json({ ...user.toObject(), profileDetails: profile || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Get all public authors (base + profile details)
router.get("/public-authors", async (req, res) => {
  try {
    const users = await User.find({}, "-password");

    const populatedUsers = await Promise.all(
      users.map(async (user) => {
        const profile = await UserProfile.findOne({ user: user._id });
        return {
          ...user.toObject(),
          profileDetails: profile || {},
        };
      })
    );

    res.json(populatedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Update basic user info
router.put("/profile", auth(), async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { ...req.body },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🔹 Update extended profile (bio, aboutMe, social, bannerImage, expertise, pinnedPost, readingList)
router.patch("/profile/details", auth(), async (req, res) => {
  try {
    const {
      bio,
      aboutMe,
      socialLinks,
      bannerImage,
      expertise,
      pinnedPost,
      readingList,
    } = req.body;

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          ...(bio && { bio }),
          ...(aboutMe && { aboutMe }),
          ...(socialLinks && { socialLinks }),
          ...(bannerImage && { bannerImage }),
          ...(expertise && { expertise }),
          ...(pinnedPost && { pinnedPost }),
          ...(readingList && { readingList }),
        },
      },
      { new: true, upsert: true }
    );

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ reputation: -1 })
      .limit(10)
      .select("name reputation level");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Get top authors (by post count)
router.get("/top-authors", async (req, res) => {
  try {
    const authors = await User.find({ posts: { $exists: true, $ne: [] } })
      .select("userName displayName profileImage posts reputation level")
      .lean();

    const sortedAuthors = authors
      .map((user) => ({ ...user, postCount: user.posts.length }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10);

    res.json(sortedAuthors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top authors" });
  }
});

// 🔹 Get public profile by displayName
router.get("/:displayName", async (req, res) => {
  try {
    const user = await User.findOne({
      displayName: req.params.displayName,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await UserProfile.findOne({ user: user._id });

    res.json({ ...user.toObject(), ...profile?.toObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Follow user
router.post("/:displayName/follow", auth(), async (req, res) => {
  try {
    const { displayName } = req.params;

    const targetUser = await User.findOne({ displayName });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Prevent following yourself
    if (req.user.id === targetUser._id.toString())
      return res.status(400).json({ message: "You cannot follow yourself" });

    const userToFollow = await UserProfile.findOne({ user: targetUser._id });
    const currentUser = await UserProfile.findOne({ user: req.user.id });
    console.log("Follow attempt by:", req.user.id);
    console.log("Target user displayName:", displayName);
    const profile = await UserProfile.findOne({ user: req.user.id });
    console.log("Logged in user's profile:", profile);

    if (!userToFollow || !currentUser)
      return res.status(404).json({ message: "Profile not found" });

    if (userToFollow.followers.includes(req.user.id))
      return res.status(400).json({ message: "Already following" });


    userToFollow.followers.push(req.user.id);
    currentUser.following.push(targetUser._id);


    await Promise.all([userToFollow.save(), currentUser.save()]);

    res.json({
      message: "Followed successfully",
      followerCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Unfollow user
router.post("/:displayName/unfollow", auth(), async (req, res) => {
  try {
    const { displayName } = req.params;

    const targetUser = await User.findOne({ displayName });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Prevent self-unfollowing
    if (req.user.id === targetUser._id.toString())
      return res.status(400).json({ message: "You cannot unfollow yourself" });

    const userToUnfollow = await UserProfile.findOne({
      user: targetUser._id,
    });
    const currentUser = await UserProfile.findOne({
      user: req.user.id,
    });

    if (!userToUnfollow || !currentUser)
      return res.status(404).json({ message: "Profile not found" });

    // Check if already not following
    if (!userToUnfollow.followers.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    // Remove follower/following references
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );

    await Promise.all([userToUnfollow.save(), currentUser.save()]);

    res.json({
      message: "Unfollowed successfully",
      followerCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
